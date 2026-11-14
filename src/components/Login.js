import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
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

const MIN_PASSWORD = 8;
const RESEND_COOLDOWN_S = 60; // Firebase also throttles verification emails server-side

// Firebase error codes to plain language
function friendly(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "That email and password don't match. Check them and try again.";
  if (code.includes("email-already-in-use")) return "An account with this email already exists. Log in instead.";
  if (code.includes("weak-password") || code.includes("password-does-not-meet-requirements")) return `Use a stronger password, at least ${MIN_PASSWORD} characters.`;
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("user-disabled")) return "This account has been disabled.";
  if (code.includes("too-many-requests")) return "Too many attempts. Wait a few minutes and try again.";
  if (code.includes("network")) return "No connection. Check your internet and try again.";
  return "Something went wrong. Please try again.";
}

// Create the Firestore profile on the first verified sign-in. The security rules only allow
// verified users to write it. Best effort: a profile failure must not block entering the app.
async function ensureProfile(user) {
  try {
    const ref = doc(db, "profiles", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        name: user.displayName || "User",
        email: user.email,
        preference: "all",
        allergies: "",
        foodType: "home-cooked",
        createdAt: new Date().toISOString(),
      });
    }
  } catch (profileError) {
    console.warn("Signed in, but the profile could not be loaded:", profileError);
  }
}

function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState({ text: "", tone: "info" });
  const [loading, setLoading] = useState(false);
  // Signed in but email not verified yet: show the "check your inbox" step instead of the form
  const [pendingUser, setPendingUser] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => onAuthStateChanged(auth, (u) => setPendingUser(u && !u.emailVerified ? u : null)), []);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Runs an async action with loading state and plain-language errors
  const run = async (action) => {
    setMessage({ text: "", tone: "info" });
    setLoading(true);
    try {
      await action();
    } catch (error) {
      console.error("Auth Error:", error);
      setMessage({ text: friendly(error), tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister && password.length < MIN_PASSWORD) {
      setMessage({ text: `Use a password with at least ${MIN_PASSWORD} characters.`, tone: "error" });
      return;
    }
    run(async () => {
      if (isRegister) {
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(user, { displayName: name.trim() }).catch(() => {});
        await sendEmailVerification(user);
        setCooldown(RESEND_COOLDOWN_S);
        setPendingUser(user);
        return;
      }
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!user.emailVerified) {
        setPendingUser(user);
        setMessage({ text: "Verify your email address to continue.", tone: "info" });
        return;
      }
      await ensureProfile(user);
      navigate("/");
    });
  };

  const checkVerified = () =>
    run(async () => {
      const user = auth.currentUser;
      if (!user) return setPendingUser(null);
      await user.reload();
      if (!user.emailVerified) {
        setMessage({ text: "Not verified yet. Open the link in the email we sent, then try again.", tone: "error" });
        return;
      }
      // A fresh token carries email_verified=true for the app gate and the Firestore rules
      await user.getIdToken(true);
      await ensureProfile(user);
      navigate("/");
    });

  const resend = () =>
    run(async () => {
      if (!auth.currentUser) return setPendingUser(null);
      await sendEmailVerification(auth.currentUser);
      setCooldown(RESEND_COOLDOWN_S);
      setMessage({ text: `Sent again to ${auth.currentUser.email}.`, tone: "success" });
    });

  const switchAccount = () =>
    run(async () => {
      await signOut(auth);
      setPendingUser(null);
      setPassword("");
      setIsRegister(false);
    });

  const switchMode = () => {
    setIsRegister(!isRegister);
    setMessage({ text: "", tone: "info" });
  };

  const messageBox = message.text && (
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
  );

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
        {pendingUser ? (
          <div className="relative w-full max-w-sm lg:mx-auto">
            <h1 className="text-3xl font-semibold tracking-[-0.02em]">Check your inbox</h1>
            <p className="mt-2 text-ink-soft">
              We sent a verification link to <span className="font-medium text-ink">{pendingUser.email}</span>. Open it, then come back
              and continue.
            </p>
            <div className="mt-8 grid gap-3">
              {messageBox}
              <Button onClick={checkVerified} loading={loading} className="w-full">
                I've verified my email
              </Button>
              <Button variant="secondary" onClick={resend} disabled={loading || cooldown > 0} className="w-full">
                {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend email"}
              </Button>
            </div>
            <p className="mt-6 text-sm text-ink-soft">Can't find it? Check your spam or promotions folder.</p>
            <p className="mt-2 text-sm text-ink-soft">
              Wrong address?{" "}
              <button type="button" onClick={switchAccount} className="rounded font-medium text-ink underline decoration-forest/40 decoration-2 underline-offset-4 hover:decoration-forest">
                Use a different account
              </button>
            </p>
          </div>
        ) : (
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
            <Field label="Password" htmlFor="password" hint={isRegister ? `At least ${MIN_PASSWORD} characters` : undefined}>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Create a password" : "Your password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? MIN_PASSWORD : undefined}
                required
              />
            </Field>

            {messageBox}

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
        )}
      </main>
    </div>
  );
}

export default Login;
