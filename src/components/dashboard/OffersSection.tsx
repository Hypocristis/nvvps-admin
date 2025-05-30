import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus } from "lucide-react"
import { Offer } from "../../app/types/financial"
import { getOfferStatusColor, getExpirationColor } from "@/utils/financial"
import { OfferDialog } from "./OfferDialog"

interface OffersSectionProps {
  offers: Offer[]
  searchTerm: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onEdit: (item: any, type: string) => void
}

export function OffersSection({
  offers,
  searchTerm,
  isLoading,
  onSearchChange,
  onEdit,
}: OffersSectionProps) {
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false)

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.client.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Oferty</h2>
        <div className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Szukaj oferty..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Button size="sm" className="transition-all duration-200 hover:scale-105" onClick={() => setIsAddOfferOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj ofertę
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tytuł</TableHead>
            <TableHead>Klient</TableHead>
            <TableHead>Kwota</TableHead>
            <TableHead>Data utworzenia</TableHead>
            <TableHead>Wygasa za</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOffers.map((offer) => (
            <TableRow key={offer.id} className="transition-all duration-200 hover:bg-muted/50">
              <TableCell className="font-medium">{offer.title}</TableCell>
              <TableCell>{offer.client}</TableCell>
              <TableCell>{offer.amount.toLocaleString()} zł</TableCell>
              <TableCell>{offer.createdDate}</TableCell>
              <TableCell>
                <span className={getExpirationColor(offer.daysToExpiration)}>{offer.daysToExpiration} dni</span>
              </TableCell>
              <TableCell>
                <Badge variant={getOfferStatusColor(offer.status)}>{offer.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(offer, "offer")}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <OfferDialog
        open={isAddOfferOpen}
        onOpenChange={setIsAddOfferOpen}
      />
    </div>
  )
} 