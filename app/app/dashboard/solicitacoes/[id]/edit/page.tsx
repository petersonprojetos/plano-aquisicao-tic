


import { EditRequestForm } from "@/components/requests/edit-request-form";

export default function EditRequestPage({ params }: { params: { id: string } }) {
  return <EditRequestForm requestId={params.id} />;
}

