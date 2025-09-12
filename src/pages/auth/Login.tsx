import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { useAuth } from "@/App";
import Logo from "@/assets";

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "admin",
    password: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    const success = await login(formData.username, formData.password);
    setIsLoading(false);

    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Use admin / admin");
    }
  };

  return (
    <div className="min-h-screen bg-card flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Glassy Card */}
        <Card className="w-full backdrop-blur-md bg-card border shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="flex justify-center">
              <img src={Logo} className="h-20 w-20 drop-shadow-lg" />
            </div>
            <CardTitle className="text-2xl font-[400]">
              NAFIS BI-Tool Login
            </CardTitle>
            
          </CardHeader>

          <CardContent className="space-y-4 w-full">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Username Field */}
            <div className="space-y-2 w-full">
              <Label
                htmlFor="username"
                className="text-sm font-medium "
              >
                NAFIS LDAP
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 z-10" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your LDAP username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10 w-full rounded-xl border bg-card outline-none backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 w-full">
              <Label
                htmlFor="password"
                className="text-sm font-medium "
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-5 z-10" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 w-full rounded-xl border bg-card backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
