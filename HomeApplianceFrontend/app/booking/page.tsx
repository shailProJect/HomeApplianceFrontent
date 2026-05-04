"use client";

import { Suspense } from "react";
import BookingContent from "./BookingContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}