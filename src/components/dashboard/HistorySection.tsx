import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Undo2 } from "lucide-react";
import { HistoryEntry } from '../../app/types/financial';

interface HistorySectionProps {
  historyLog: HistoryEntry[];
  historyFilter: string;
  onHistoryFilterChange: (value: string) => void;
  isLoading: boolean;
  onRevert?: (historyItem: HistoryEntry) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  historyLog,
  historyFilter,
  onHistoryFilterChange,
  isLoading,
  onRevert,
}) => {
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Historia zmian</h2>
        <Select value={historyFilter} onValueChange={onHistoryFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtruj według typu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie zmiany</SelectItem>
            <SelectItem value="Faktura">Faktury</SelectItem>
            <SelectItem value="Wydatek">Wydatki</SelectItem>
            <SelectItem value="Oferta">Oferty</SelectItem>
            <SelectItem value="Płatność cykliczna">Płatności cykliczne</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log aktywności</CardTitle>
          <CardDescription>Wszystkie zmiany w systemie z możliwością cofnięcia</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-4">
              {historyLog
                .filter((item) => historyFilter === "all" || item.type === historyFilter)
                .map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start justify-between p-4 rounded-lg border transition-all duration-200 hover:bg-muted/50">
                      <div className="flex items-start gap-3">
                        <img
                          className="h-8 w-8 rounded-full object-cover border"
                          src={item.user?.imageUrl || "/placeholder.svg?height=32&width=32"}
                          alt={item.user?.fullName || item.user?.name || "User"}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                item.action === "Dodano"
                                  ? "default"
                                  : item.action === "Edytowano"
                                    ? "secondary"
                                    : item.action === "Usunięto"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {item.action}
                            </Badge>
                            <Badge variant="outline">{item.type}</Badge>
                            <span className="text-sm text-muted-foreground">{item.itemId}</span>
                          </div>
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.user?.fullName || item.user?.name || "Użytkownik"} • {item.timestamp}
                          </p>
                          {item.changes && (
                            <div className="mt-2 text-xs">
                              {item.changes.before && (
                                <div className="text-red-600">
                                  Przed: {JSON.stringify(item.changes.before, null, 2)}
                                </div>
                              )}
                              {item.changes.after && (
                                <div className="text-green-600">
                                  Po: {JSON.stringify(item.changes.after, null, 2)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {item.revertible && onRevert && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRevert(item)}
                            className="transition-all duration-200 hover:scale-105"
                          >
                            <Undo2 className="h-4 w-4 mr-1" />
                            Cofnij
                          </Button>
                        )}
                      </div>
                    </div>
                    {index < historyLog.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              {historyLog.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Brak zmian w historii. Rozpocznij pracę, aby zobaczyć log aktywności.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 