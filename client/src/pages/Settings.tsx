import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Bell, Shield, Wallet, Globe, Loader2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import type { UserSettings } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      await apiRequest("PATCH", "/api/settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  const handleCurrencyChange = (currency: string) => {
    updateMutation.mutate({ currency });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as "dark" | "light");
    updateMutation.mutate({ theme: newTheme });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6" data-testid="page-settings">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences</p>
          </div>
        </div>
        <div className="space-y-6 max-w-2xl">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="page-settings">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Display Preferences */}
        <Card data-testid="card-display-settings">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Display</CardTitle>
            </div>
            <CardDescription>
              Customize how prices and data are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Currency</Label>
                <p className="text-sm text-muted-foreground">
                  Display prices in your preferred currency
                </p>
              </div>
              <Select
                value={settings?.currency || "USD"}
                onValueChange={handleCurrencyChange}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="w-[120px]" data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (&#8364;)</SelectItem>
                  <SelectItem value="GBP">GBP (&#163;)</SelectItem>
                  <SelectItem value="JPY">JPY (&#165;)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark mode
                </p>
              </div>
              <Select
                value={theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger className="w-[120px]" data-testid="select-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card data-testid="card-notification-settings">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Price Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when prices change significantly
                </p>
              </div>
              <Switch
                checked={settings?.priceAlerts ?? true}
                onCheckedChange={(checked) => handleToggle("priceAlerts", checked)}
                disabled={updateMutation.isPending}
                data-testid="switch-price-alerts"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Transaction Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when trades are completed
                </p>
              </div>
              <Switch
                checked={settings?.transactionNotifications ?? true}
                onCheckedChange={(checked) => handleToggle("transactionNotifications", checked)}
                disabled={updateMutation.isPending}
                data-testid="switch-transaction-notifications"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Market Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily market summary updates
                </p>
              </div>
              <Switch
                checked={settings?.marketUpdates ?? false}
                onCheckedChange={(checked) => handleToggle("marketUpdates", checked)}
                disabled={updateMutation.isPending}
                data-testid="switch-market-updates"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card data-testid="card-security-settings">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Protect your account with additional security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings?.twoFactorEnabled ?? false}
                onCheckedChange={(checked) => handleToggle("twoFactorEnabled", checked)}
                disabled={updateMutation.isPending}
                data-testid="switch-two-factor"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card data-testid="card-account-info">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Account</CardTitle>
            </div>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm text-muted-foreground mb-2">
                This is a simulated trading platform for demonstration purposes.
              </p>
              <p className="text-sm text-muted-foreground">
                No real money is involved, and all trades are simulated using mock data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
