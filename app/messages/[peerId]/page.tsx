// app/messages/[peerId]/page.jsx
// This route pre-dates the query-param based /messages?peer=<id> pattern used
// everywhere else in the app (sidebar, profile "Message" button, perception
// detail page). It duplicated ChatWindow without the conversation list and
// read an auth token from a field useCurrentUser() never returns, so it never
// actually worked. Redirecting keeps old links alive without keeping dead code.
import { redirect } from "next/navigation";

export default async function ChatPageRedirect({ params }: { params: Promise<{ peerId: string }> }) {
  const { peerId } = await params;
  redirect(`/messages?peer=${peerId}`);
}
