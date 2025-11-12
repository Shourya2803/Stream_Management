"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast, { Toaster } from "react-hot-toast";

export default function Form() {
  type FormData = {
    name: string;
    email: string;
    phone: string;
    branchChoice1: string;
    branchChoice2: string;
    english10: string;
    maths10: string;
    science10: string;
    hindi10: string;
    social10: string;
    physics12: string;
    chemistry12: string;
    maths12: string;
    marksheetUrl: string; // <-- Added marksheet upload URL field
  };

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    branchChoice1: "",
    branchChoice2: "",
    english10: "",
    maths10: "",
    science10: "",
    hindi10: "",
    social10: "",
    physics12: "",
    chemistry12: "",
    maths12: "",
    marksheetUrl: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [uploading, setUploading] = useState(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof FormData;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // File upload to Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "student_uploads"); // Replace with your Cloudinary preset

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dj9elwflm/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, marksheetUrl: data.secure_url }));
        toast.success("Marksheet uploaded successfully!");
      } else {
        toast.error("Upload failed!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading marksheet!");
    } finally {
      setUploading(false);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name) newErrors.name = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.phone) {
      newErrors.phone = "Required";
    } else {
      const phoneTrim = formData.phone.trim();
      if (!/^[0-9]+$/.test(phoneTrim)) {
        newErrors.phone = "Phone number must contain digits only";
      } else {
        const phoneNum = parseInt(phoneTrim, 10);
        if (isNaN(phoneNum) || phoneNum < 0) {
          newErrors.phone = "Phone number must be a positive integer";
        }
      }
    }

    if (!formData.branchChoice1) newErrors.branchChoice1 = "Required";
    if (!formData.branchChoice2) newErrors.branchChoice2 = "Required";

    const class10Fields: (keyof FormData)[] = ["english10", "maths10", "science10", "hindi10", "social10"];
    class10Fields.forEach((field) => {
      const value = parseFloat(formData[field]);
      if (!formData[field] || isNaN(value) || value < 0 || value > 100) {
        newErrors[field] = "Marks must be between 0 and 100";
      }
    });

    const class12Fields: (keyof FormData)[] = ["physics12", "chemistry12", "maths12"];
    class12Fields.forEach((field) => {
      const value = parseFloat(formData[field]);
      if (!formData[field] || isNaN(value) || value < 0 || value > 100) {
        newErrors[field] = "Marks must be between 0 and 100";
      }
    });

    if (!formData.marksheetUrl) newErrors.marksheetUrl = "Please upload your Class 12 Marksheet";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Form submitted successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          branchChoice1: "",
          branchChoice2: "",
          english10: "",
          maths10: "",
          science10: "",
          hindi10: "",
          social10: "",
          physics12: "",
          chemistry12: "",
          maths12: "",
          marksheetUrl: "",
        });
      } else {
        const errorData = await res.json();
        if (errorData.error === "Student already registered") {
          toast.error("You have already filled the form.");
        } else {
          toast.error("Submission failed!");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  // Helper for input
  const renderInput = (name: keyof FormData, label: string, type = "text", placeholder?: string) => (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-slate-200">
        {label} <span className="text-red-500">*</span>
      </Label>
      <Input
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder || label}
        required
        className={`text-sm px-3 py-2 rounded-md focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400
          bg-white text-gray-900 placeholder-gray-400 border border-gray-300
          dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:border-slate-600
          ${errors[name] ? "ring-1 ring-red-500 border-red-500" : ""}`}
      />
      {errors[name] && <p className="text-red-500 text-xs">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 dark:bg-slate-900 dark:text-slate-100">
      <Toaster position="top-right" />
      <form className="max-w-4xl mx-auto space-y-8">
        {/* Personal Details */}
        <Card className="border border-gray-200 shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-slate-100">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput("name", "Full Name", "text", "e.g. Shourya Mittal")}
            {renderInput("email", "Email", "email", "e.g. shourya@email.com")}
            {renderInput("phone", "Phone Number", "tel", "e.g. 9876543210")}
            {renderInput("branchChoice1", "1st Branch Preference", "text", "e.g. CSE")}
            {renderInput("branchChoice2", "2nd Branch Preference", "text", "e.g. Mechanical")}
          </CardContent>
        </Card>

        {/* Class 10 Marks */}
        <Card className="border border-gray-200 shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-slate-100">Class 10 Marks</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderInput("english10", "English", "number")}
            {renderInput("maths10", "Mathematics", "number")}
            {renderInput("science10", "Science", "number")}
            {renderInput("hindi10", "Hindi", "number")}
            {renderInput("social10", "Social Science", "number")}
          </CardContent>
        </Card>

        {/* Class 12 Marks + Marksheet Upload */}
        <Card className="border border-gray-200 shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-slate-100">Class 12 Marks</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderInput("physics12", "Physics", "number")}
            {renderInput("chemistry12", "Chemistry", "number")}
            {renderInput("maths12", "Mathematics", "number")}
          </CardContent>
          <CardContent className="mt-4">
            <Label className="text-sm font-medium text-gray-700 dark:text-slate-200">
              Upload Class 12 Marksheet <span className="text-red-500">*</span>
            </Label>
            <Input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="mt-2" />
            {uploading && <p className="text-blue-500 text-xs mt-1">Uploading...</p>}
            {formData.marksheetUrl && (
              <p className="text-green-500 text-xs mt-1">Uploaded Successfully ✓</p>
            )}
            {errors.marksheetUrl && <p className="text-red-500 text-xs">{errors.marksheetUrl}</p>}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm transition shadow-sm"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
