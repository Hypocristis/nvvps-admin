import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, TrendingDown, TrendingUp } from "lucide-react";
import { RecurringPayment } from '../../app/types/financial';

interface RecurringPaymentsSectionProps {
  recurringPayments: RecurringPayment[];
  onToggleStatus: (id: number) => void;
  onEdit: (item: any, type: string) => void;
}

export const RecurringPaymentsSection: React.FC<RecurringPaymentsSectionProps> = ({
  recurringPayments,
  onToggleStatus,
  onEdit,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Płatności cykliczne</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead>Kwota</TableHead>
            <TableHead>Częstotliwość</TableHead>
            <TableHead>Kategoria</TableHead>
            <TableHead>Następna płatność</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recurringPayments.map((payment) => (
            <TableRow key={payment.id} className="transition-all duration-200 hover:bg-muted/50">
              <TableCell className="font-medium">{payment.name}</TableCell>
              <TableCell>{payment.amount.toLocaleString()} zł</TableCell>
              <TableCell>{payment.frequency}</TableCell>
              <TableCell>{payment.category}</TableCell>
              <TableCell>{payment.nextPayment}</TableCell>
              <TableCell>
                <Badge variant={payment.active ? "default" : "secondary"}>
                  {payment.active ? "Aktywna" : "Nieaktywna"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(payment, "recurring")}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(payment.id)}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {payment.active ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 