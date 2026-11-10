import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { LogOut, Save } from "lucide-react";
import { PageHeader, Button, Input, Select, Field, Sheet, Skeleton, ErrorNote, Segmented } from "../ui/ui";
import { useToast } from "../ui/Toast";
import { useStoredState, KEYS } from "../lib/storage";

function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [, setLocalProfile] = useStoredState(KEYS.profile, {});

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [preference, setPreference] = useState("all");
  const [allergies, setAllergies] = useState("");
  const [foodType, setFoodType] = useState("home-cooked");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Watch for login state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
      await loadProfile(currentUser.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Load user profile data
  const loadProfile = async (uid) => {
    try {
      const docSnap = await getDoc(doc(db, "profiles", uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || "");
        setPreference(data.preference || "all");
        setAllergies(data.allergies || "");
        setFoodType(data.foodType || "home-cooked");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Couldn't load your profile. You can still edit and save it.");
    } finally {
      setLoading(false);
    }
  };

  // Save profile data to Firestore
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      await setDoc(
        doc(db, "profiles", user.uid),
        { name, preference, allergies, foodType, email: user.email, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      // Recipes read the diet preference locally, so keep both in step
      setLocalProfile((p) => ({ ...(p || {}), dietPreference: preference }));
      toast("Profile saved");
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Couldn't save your profile. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("currentUser");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your name and food preferences. The meal preference filters recipe suggestions."
        actions={<Button variant="secondary" icon={LogOut} onClick={handleLogout}>Log out</Button>}
      />

      <Sheet className="max-w-2xl p-5 sm:p-8">
        {loading ? (
          <div className="grid gap-6" aria-busy="true" aria-label="Loading profile">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="grid gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="grid gap-6">
            {error && <ErrorNote>{error}</ErrorNote>}

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Name" htmlFor="name">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
              </Field>
              <Field label="Email" htmlFor="email">
                <Input id="email" value={user?.email || ""} readOnly disabled />
              </Field>
            </div>

            <div className="flex flex-col gap-1.5">
              <span id="pref-label" className="text-sm font-medium">Meal preference</span>
              <div aria-labelledby="pref-label">
                <Segmented
                  label="Meal preference"
                  value={preference}
                  onChange={setPreference}
                  options={[
                    { value: "all", label: "All" },
                    { value: "veg", label: "Vegetarian" },
                    { value: "nonveg", label: "Non-vegetarian" },
                  ]}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Allergies" htmlFor="allergies" hint="Separate with commas">
                <Input id="allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. peanuts, lactose, gluten" />
              </Field>
              <Field label="Usually eats" htmlFor="food-type">
                <Select id="food-type" value={foodType} onChange={(e) => setFoodType(e.target.value)}>
                  <option value="home-cooked">Home cooked</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="street">Street food</option>
                </Select>
              </Field>
            </div>

            <div className="flex justify-end border-t border-forest/10 pt-6">
              <Button type="submit" icon={Save} loading={saving}>Save profile</Button>
            </div>
          </form>
        )}
      </Sheet>
    </>
  );
}

export default ProfilePage;
