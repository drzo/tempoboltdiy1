import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth callback or email confirmation
        const { error } = await supabase.auth.getSession();
        if (error) throw error;

        // Redirect back to the main app
        navigate("/");
      } catch (err) {
        console.error("Error during auth callback:", err);
        setError(err.message || "Authentication failed");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md text-center">
        <h2 className="text-xl font-bold mb-2">Authenticating...</h2>
        <p className="text-gray-700">
          Please wait while we complete the authentication process.
        </p>
      </div>
    </div>
  );
}
