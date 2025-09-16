
"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect, useMemo } from 'react';
import { listAllUsers, deleteUser, UserRecord, resetUserPasswordToDefault, getVisitorCount } from '@/app/actions/admin-actions';
import AuthGuard from '@/components/auth-guard';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, KeyRound, Loader2, AlertTriangle, RefreshCw, ArrowUpDown, LogOut, ShieldCheck, Monitor, Smartphone, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

type SortKey = 'creationTime' | 'lastSignInTime';
type SortDirection = 'ascending' | 'descending';

function AdminDashboardPageContent() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout, user: adminUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // For any user action
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'lastSignInTime', direction: 'descending' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userList, visitors] = await Promise.all([
        listAllUsers(),
        getVisitorCount()
      ]);
      // Filter out the current admin user from the list
      const filteredUsers = userList.filter(user => user.uid !== adminUser?.uid);
      setUsers(filteredUsers);
      setVisitorCount(visitors);
    } catch (e: any) {
      setError(e.message);
      toast({
          title: 'Error',
          description: e.message,
          variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser) { // Fetch data only when admin user is available
      fetchData();
    }
  }, [adminUser]);
  
  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aValue = new Date(a[sortConfig.key]).getTime();
        const bValue = new Date(b[sortConfig.key]).getTime();
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const handleDelete = async (uid: string) => {
    setIsProcessing(uid);
    const result = await deleteUser(uid);
    if (result.success) {
      toast({
        title: 'User Deleted',
        description: 'The user has been successfully removed.',
        variant: 'success',
      });
      fetchData(); // Re-fetch all data
    } else {
      toast({
        title: 'Deletion Failed',
        description: result.message,
        variant: 'error',
      });
    }
    setIsProcessing(null);
  };
  
  const handleResetPassword = async (uid: string) => {
    setIsProcessing(uid);
    const result = await resetUserPasswordToDefault(uid);
    if (result.success) {
        toast({
            title: 'Password Reset',
            description: result.message,
            variant: 'success'
        });
    } else {
        toast({
            title: 'Reset Failed',
            description: result.message,
            variant: 'error'
        });
    }
     setIsProcessing(null);
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const getInitials = (name?: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const isOnline = (sessions: UserRecord['sessions']) => {
    return (sessions.desktop + sessions.mobile) > 0;
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'ascending' ? <span className="ml-2">↑</span> : <span className="ml-2">↓</span>;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return `${seconds} seconds ago`;
    }

    return formatDistanceToNow(date, { addSuffix: true });
  };


  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-background shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-background p-6 rounded-lg border shadow-sm flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Visitors</p>
                    {visitorCount === null ? (
                        <div className="h-7 w-12 bg-muted rounded animate-pulse" />
                    ) : (
                        <p className="text-2xl font-bold">{visitorCount.toLocaleString()}</p>
                    )}
                </div>
            </div>
        </div>

        <div className="bg-background rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                Refresh
            </Button>
          </div>

          {loading && !users.length ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-destructive bg-destructive/10 rounded-lg p-4">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">Failed to Load Users</h3>
                <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Active Sessions</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => requestSort('creationTime')}>
                        Created
                        {getSortIndicator('creationTime')}
                      </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" size="sm" onClick={() => requestSort('lastSignInTime')}>
                         Last Sign-In
                         {getSortIndicator('lastSignInTime')}
                       </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           <div className="relative">
                               <Avatar className="h-11 w-11 rounded-full">
                                   <AvatarImage src={user.photoURL || undefined} />
                                   <AvatarFallback className="rounded-full">{getInitials(user.displayName)}</AvatarFallback>
                               </Avatar>
                               <span className={cn(
                                   "absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background",
                                   isOnline(user.sessions) ? "bg-green-500 shadow-[0_0_8px_theme(colors.green.400)]" : "bg-red-500 shadow-[0_0_8px_theme(colors.red.400)]"
                                )}/>
                           </div>
                            <div>
                                <p className="font-medium">{user.displayName || 'No Name'}</p>
                                <p className="text-xs text-muted-foreground">{user.uid}</p>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                          <div className="flex items-center gap-4">
                              {user.sessions.desktop > 0 && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Monitor className="h-4 w-4" />
                                  <span className="text-sm font-medium">{user.sessions.desktop}</span>
                                </div>
                              )}
                              {user.sessions.mobile > 0 && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Smartphone className="h-4 w-4" />
                                  <span className="text-sm font-medium">{user.sessions.mobile}</span>
                                </div>
                              )}
                              {user.sessions.desktop === 0 && user.sessions.mobile === 0 && (
                                  <span className="text-xs text-muted-foreground/70">None</span>
                              )}
                          </div>
                      </TableCell>
                      <TableCell>{formatRelativeTime(user.creationTime)}</TableCell>
                      <TableCell>{formatRelativeTime(user.lastSignInTime)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            {/* Reset Password */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" disabled={isProcessing === user.uid}>
                                      {isProcessing === user.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          This will reset the password for <span className="font-bold">{user.displayName || user.email}</span> to the default password <span className="font-bold">"Cardify@2025"</span>. Are you sure?
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleResetPassword(user.uid)}>Reset Password</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {/* Delete User */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" disabled={isProcessing === user.uid || user.uid === adminUser?.uid}>
                                  {isProcessing === user.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account for <span className="font-bold">{user.displayName || user.email}</span>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(user.uid)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// We need a separate component for the router to be used
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
    return (
        <AuthGuard>
            <AdminDashboardPageContent />
        </AuthGuard>
    );
}
