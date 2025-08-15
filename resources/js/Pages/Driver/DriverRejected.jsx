import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DriverRejected() {
  return (
    <AuthenticatedLayout>
      <div className="max-w-3xl mx-auto text-center py-20">
        <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Driver Application Rejected</h1>
        <p className="text-gray-700 text-lg">
          Unfortunately, your driver registration has been rejected.
        </p>
        <p className="text-gray-600 mt-2">
          If you believe this is a mistake or want to reapply, please contact support or resubmit your application.
        </p>


      </div>
    </AuthenticatedLayout>
  );
}
