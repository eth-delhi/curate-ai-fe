"use client";

export const AuthDivider = () => {
  return (
    <div className="relative flex items-center justify-center my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative px-4 bg-white text-sm text-gray-500 rounded-md">
        Or continue with
      </div>
    </div>
  );
};
