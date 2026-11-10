import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Refrigerator, ChefHat, CalendarDays, ShoppingBasket } from "lucide-react";
import { Button, Input, Field } from "../ui/ui";
import { Logo } from "./AppShell";

const LOOP = [
  { icon: Refrigerator, title: "Pantry", text: "Note what you already have" },
  { icon: ChefHat, title: "Recipes", text: "Get dishes that use it" },
  { icon: CalendarDays, title: "Week", text: "Plan breakfast to dinner" },
  { icon: ShoppingBasket, title: "List", text: "Buy only what's missing" },
];

// Firebase error codes to plain language
function friendly(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "That email and password don't match. Check them and try again.";
  if (code.includes("email-already-in-use")) return "An account with this email already exists. Log in instead.";
  if (code.includes("weak-password")) return "Use a password with at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("too-many-requests")) return "Too many attempts. Wait a minute and try again.";
  if (code.includes("network")) return "No connection. Check your internet and try again.";
  return error?.message || "Authentication failed.";
}

function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState({ text: "", tone: "info" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", tone: "info" });
    setLoading(true);

    try {
      if (isRegister) {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save profile to Firestore. The account already exists at this point, so a
        // Firestore failure (e.g. restrictive security rules) must not report sign-up as failed.
        try {
          await setDoc(doc(db, "profiles", user.uid), {
            name: name || "New User",
            email: user.email,
            preference: "all",
            allergies: "",
            foodType: "home-cooked",
            createdAt: new Date().toISOString(),
          });
        } catch (profileError) {
          console.warn("Account created, but the profile could not be saved:", profileError);
        }

        setMessage({ text: "Account created. Log in to continue.", tone: "success" });
        setTimeout(() => {
          setIsRegister(false);
          setMessage({ text: "", tone: "info" });
        }, 2000);
      } else {
        // Login existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create profile if not exists. Sign-in has already succeeded, so a Firestore
        // failure here must not block the user from entering the app.
        try {
          const docSnap = await getDoc(doc(db, "profiles", user.uid));
          if (!docSnap.exists()) {
            await setDoc(doc(db, "profiles", user.uid), {
              name: "User",
              email: user.email,
              preference: "all",
              allergies: "",
              foodType: "home-cooked",
            });
          }
        } catch (profileError) {
          console.warn("Signed in, but the profile could not be loaded:", profileError);
        }

        localStorage.setItem("currentUser", JSON.stringify(user));
        setMessage({ text: "Logged in. Opening your kitchen…", tone: "success" });
        setTimeout(() => navigate("/"), 600);
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setMessage({ text: friendly(error), tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setMessage({ text: "", tone: "info" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Brand panel */}
      <aside className="on-forest relative hidden flex-col justify-between bg-forest px-12 py-10 text-cream lg:flex">
        <Logo size="lg" />
        <div className="max-w-md">
          <p className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-cream [font-variation-settings:'opsz'_48] [text-wrap:balance]">
            Cook from what you have. Buy only what you need.
          </p>
          <ol className="mt-10 flex flex-col">
            {LOOP.map((step, i) => (
              <li key={step.title} className="flex items-center gap-4 border-t border-cream/10 py-4 last:border-b">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-600 text-cream">
                  <step.icon size={18} strokeWidth={1.75} aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block font-medium text-cream">{step.title}</span>
                  <span className="block text-sm text-cream/70">{step.text}</span>
                </span>
                {i === 0 && <span className="rounded-sm bg-pink px-2 py-0.5 text-xs font-semibold text-forest-900">Start here</span>}
              </li>
            ))}
          </ol>
        </div>
        <p className="text-sm text-cream/60">Recipes from TheMealDB · Products from Open Food Facts</p>
      </aside>

      {/* Form */}
      <main className="relative flex flex-col px-5 py-8 sm:px-10 lg:justify-center lg:px-16">
        <div className="relative mb-10 lg:hidden">
          <Logo tone="forest" />
        </div>
        <div className="relative w-full max-w-sm lg:mx-auto">
          <h1 className="text-3xl font-semibold tracking-[-0.02em]">{isRegister ? "Create your account" : "Log in"}</h1>
          <p className="mt-2 text-ink-soft">
            {isRegister ? "Your pantry, week and list, in one place." : "Pick up your week where you left it."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5" noValidate={false}>
            {isRegister && (
              <Field label="Name" htmlFor="name">
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" required />
              </Field>
            )}
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
            </Field>
            <Field label="Password" htmlFor="password" hint={isRegister ? "At least 6 characters" : undefined}>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Create a password" : "Your password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </Field>

            {message.text && (
              <p
                role={message.tone === "error" ? "alert" : "status"}
                className={
                  message.tone === "error"
                    ? "rounded-lg border border-danger/25 bg-danger-soft/60 px-4 py-3 text-sm text-danger"
                    : "rounded-lg border border-forest/15 bg-forest/[0.06] px-4 py-3 text-sm text-ink"
                }
              >
                {message.text}
              </p>
            )}

            <Button type="submit" loading={loading} className="mt-1 w-full">
              {loading ? (isRegister ? "Creating account" : "Logging in") : isRegister ? "Create account" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <button type="button" onClick={switchMode} className="rounded font-medium text-ink underline decoration-forest/40 decoration-2 underline-offset-4 hover:decoration-forest">
              {isRegister ? "Log in" : "Create an account"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
