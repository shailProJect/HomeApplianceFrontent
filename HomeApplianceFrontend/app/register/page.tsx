"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  User,
  Phone,
  Mail,
  Lock,
  AlertCircle,
  MapPin,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { useAuth } from "../login/auth-context";

type Role = "USER" | "PROVIDER";

const SERVICE_CATEGORIES = [
  "ELECTRICIAN",
  "PLUMBER",
  "CARPENTER",
  "PAINTER",
  "CLEANER",
  "AC_TECHNICIAN",
  "APPLIANCE_REPAIR",
  "OTHER",
];

const MapPicker = dynamic(
  () => import("@/components/MapPicker"),
  {
    ssr: false,
  }
);

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>("USER");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    serviceCategory: "",
    yearsOfExperience: "",
    serviceArea: "",
    latitude: "19.28290934155699",
    longitude: "73.05067062377931",
  });

  const set =
    (k: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({
          ...f,
          [k]: e.target.value,
        }));

  // ─────────────────────────────────────────────────────────────
  // AUTO FETCH LOCATION
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (role !== "PROVIDER") return;

    // Browser does not support location
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

   const getLocation = () => {
  setLocationLoading(true);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setForm((prev) => ({
        ...prev,
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString(),
      }));

      setLocationLoading(false);
      setError("");
    },

    (error) => {
      console.error("Location Error:", error);

      // FALLBACK TRY
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));

          setLocationLoading(false);
          setError("");
        },

        () => {
          setLocationLoading(false);

          setError(
            "Unable to fetch your location. Please select manually on map."
          );
        },

        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 120000,
        }
      );
    },

    {
      enableHighAccuracy: true,
      timeout: 4000,
      maximumAge: 0,
    }
  );
};

    // Check browser permission state first
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((permissionStatus) => {
          console.log("Permission State:", permissionStatus.state);

          if (permissionStatus.state === "granted") {
            getLocation();
          }

          else if (permissionStatus.state === "prompt") {
            // Automatically ask permission popup
            getLocation();
          }

          else if (permissionStatus.state === "denied") {
            setError(
              "Location access blocked. Please enable location permission from browser settings."
            );
          }

          // Listen for permission changes
          permissionStatus.onchange = () => {
            if (permissionStatus.state === "granted") {
              getLocation();
            }
          };
        });
    } else {
      // Fallback for unsupported browsers
      getLocation();
    }
  }, [role]);

  // ─────────────────────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.phone) {
      setError("Please fill in all required fields.");
      return;
    }

    if (role === "PROVIDER" && !form.serviceCategory) {
      setError("Please select a service category.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const body: Parameters<typeof authApi.register>[0] = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,

        ...(role === "PROVIDER" && {
          serviceCategory: form.serviceCategory,

          yearsOfExperience: form.yearsOfExperience
            ? parseInt(form.yearsOfExperience)
            : undefined,

          serviceArea: form.serviceArea || undefined,

          latitude: form.latitude
            ? parseFloat(form.latitude)
            : undefined,

          longitude: form.longitude
            ? parseFloat(form.longitude)
            : undefined,
        }),
      };

      console.log("REGISTER BODY => ", body);

      const res = await authApi.register(body);

      // const { accessToken, refreshToken } = res.data;

      // const payload = JSON.parse(atob(accessToken.split(".")[1]));

      // const user = {
      //   id: payload.sub,
      //   name: form.name,
      //   email: form.email,
      //   role: payload.role as "USER" | "PROVIDER" | "ADMIN",
      // };

      // login(user, accessToken, refreshToken);

      // if (role === "PROVIDER") {
      //   router.push("/provider/dashboard");
      // } else {
      //   router.push("/dashboard");
      // }

      router.push(
        `/verify-email?email=${encodeURIComponent(form.email)}`
      );

    } catch (err: unknown) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>

            <span className="text-xl font-bold text-foreground">
              ApnaAdmi
            </span>
          </Link>

          <p className="text-muted-foreground text-sm mt-2">
            Create your account
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Get started
          </h1>

          {/* ROLE TOGGLE */}
          <div className="flex gap-2 bg-muted p-1 rounded-xl mb-6">
            {(["USER", "PROVIDER"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  role === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "USER"
                  ? "I need services"
                  : "I provide services"}
              </button>
            ))}
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* NAME */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Full Name *
              </label>

              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />

                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={set("name")}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* PHONE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Phone Number *
              </label>

              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />

                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={set("phone")}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Email *
              </label>

              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Password *
              </label>

              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background">
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />

                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={set("password")}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* PROVIDER SECTION */}
            {role === "PROVIDER" && (
              <>
                <div className="h-px bg-border" />

                <p className="text-sm font-semibold text-foreground">
                  Provider Details
                </p>

                {/* CATEGORY */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Service Category *
                  </label>

                  <select
                    value={form.serviceCategory}
                    onChange={set("serviceCategory")}
                    className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm outline-none"
                  >
                    <option value="">Select a category</option>

                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* EXPERIENCE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Years of Experience
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={form.yearsOfExperience}
                    onChange={set("yearsOfExperience")}
                    className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm outline-none"
                  />
                </div>

                {/* SERVICE AREA */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Service Area
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Koramangala, Bangalore"
                    value={form.serviceArea}
                    onChange={set("serviceArea")}
                    className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm outline-none"
                  />
                </div>

              <div className="border border-green-200 bg-green-50 rounded-xl p-4">
  <div className="flex items-center gap-2 mb-2">
    <MapPin className="w-4 h-4 text-green-700" />

    <p className="text-sm font-medium text-green-700">
      Live Location
    </p>
  </div>

  {locationLoading ? (
    <p className="text-sm text-muted-foreground">
      Fetching current location...
    </p>
  ) : (
    <div className="space-y-2">
      {/* LATITUDE */}
      <div>
        <span className="text-xs text-muted-foreground">
          Latitude:
        </span>

        <p className="text-sm font-medium">
          {form.latitude || "Not available"}
        </p>
      </div>

      {/* LONGITUDE */}
      <div>
        <span className="text-xs text-muted-foreground">
          Longitude:
        </span>

        <p className="text-sm font-medium">
          {form.longitude || "Not available"}
        </p>
      </div>

      {/* ENABLE LOCATION BUTTON */}
      {(!form.latitude || !form.longitude) && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          Enable Location
        </button>
      )}

      {/* MANUAL MAP SELECTION */}
      <div className="mt-4">
        <p className="text-sm font-medium mb-2">
          Select Location Manually
        </p>

        <MapPicker
            latitude={
              form.latitude
                ? parseFloat(form.latitude)
                : undefined
            }
            longitude={
              form.longitude
                ? parseFloat(form.longitude)
                : undefined
            }
            onChange={(lat, lng) => {
              setForm((prev) => ({
                ...prev,
                latitude: lat.toString(),
                longitude: lng.toString(),
              }));
            }}
      />
      </div>
    </div>
  )}
</div>
              </>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* LOGIN */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}