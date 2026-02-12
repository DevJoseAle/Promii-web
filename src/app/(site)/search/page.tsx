import { Suspense } from "react";
import SearchResults from "./search-results";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Cargando...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
