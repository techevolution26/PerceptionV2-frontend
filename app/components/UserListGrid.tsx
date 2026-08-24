"use client";

import Link from "next/link";
import FollowButton from "./FollowButton";
import Avatar from "./ui/Avatar";
import Card from "./ui/Card";
import type { UserSlim } from "../types/models";

interface UserListGridProps {
  users: UserSlim[];
  currentUserId: number | string;
}

export default function UserListGrid({ users, currentUserId }: UserListGridProps) {
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="py-6 text-center italic text-foreground-subtle">
        No users to display.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {users.map((user) => (
        <Card as="li" key={user.id} hover className="flex items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <Avatar src={user.avatar_url} alt={user.name} size="md" />
            <div className="min-w-0">
              <Link
                href={`/users/${user.id}`}
                className="block truncate font-semibold text-foreground hover:underline"
              >
                {user.name}
              </Link>
              {user.profession && (
                <p className="truncate text-sm text-foreground-subtle">{user.profession}</p>
              )}
            </div>
          </div>

          {Number(user.id) !== Number(currentUserId) && (
            <div className="shrink-0">
              <FollowButton profileUserId={user.id} />
            </div>
          )}
        </Card>
      ))}
    </ul>
  );
}
