import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Offer, NewOfferFormData } from "../../app/types/financial"

interface OfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offers: Offer[]
  editingOffer?: Offer
  onSubmit?: (data: NewOfferFormData) => void
}

export function OfferDialog({ open, onOpenChange, offers, editingOffer, onSubmit }: OfferDialogProps) {
  const [formData, setFormData] = useState<NewOfferFormData>({
    title: editingOffer?.description || "",
    client: editingOffer?.client || "",
    amount: editingOffer?.amount.toString() || "",
    expirationDate: editingOffer?.validUntil || "",
    googleDocsUrl: "",
    description: editingOffer?.description || "",
  })

  const handleSubmit = () => {
    onSubmit?.(formData)
    onOpenChange(false)
    setFormData({
      title: "",
      client: "",
      amount: "",
      expirationDate: "",
      googleDocsUrl: "",
      description: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingOffer ? "Edytuj ofertę" : "Dodaj nową ofertę"}</DialogTitle>
          <DialogDescription>Wprowadź szczegóły oferty</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Tytuł oferty</Label>
            <Input
              id="title"
              placeholder="Tytuł oferty"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client">Klient</Label>
            <Input
              id="client"
              placeholder="Nazwa klienta"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Kwota (zł)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expirationDate">Data ważności</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              placeholder="Opis oferty"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="googleDocsUrl">Link do dokumentu Google</Label>
            <Input
              id="googleDocsUrl"
              type="url"
              placeholder="https://docs.google.com/..."
              value={formData.googleDocsUrl}
              onChange={(e) => setFormData({ ...formData, googleDocsUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Link do szczegółowej oferty w Google Docs</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="transition-all duration-200 hover:scale-105">
            {editingOffer ? "Zapisz zmiany" : "Dodaj ofertę"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}