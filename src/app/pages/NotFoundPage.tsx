import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white border border-slate-200 rounded-xl shadow-xs" data-testid="not-found-page">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-2">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 mb-6">
        The route you are trying to access does not exist or may have been moved.
      </p>
      <Link to="/">
        <Button variant="default" size="sm" className="gap-2 bg-slate-900">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
