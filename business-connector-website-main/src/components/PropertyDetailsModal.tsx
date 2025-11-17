import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import ImageGallery from "@/components/ImageGallery";
import PaymentBreakdown from "@/components/PaymentBreakdown";
import { MapView } from "@/components/Map";

export default function PropertyDetailsModal({ open, onOpenChange, zpid }: { open: boolean; onOpenChange: (v: boolean) => void; zpid: string | null }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!open || !zpid) return;
    setLoading(true);
    axios
      .get(`https://zillow-com1.p.rapidapi.com/property?zpid=${zpid}`, {
        headers: { "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY },
      })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [open, zpid]);

  const priceNum: number | null = data && (typeof data.price === 'number' ? data.price : (typeof data.unformattedPrice === 'number' ? data.unformattedPrice : null));
  const priceFmt = priceNum !== null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(priceNum) : (data?.priceText || '—');
  const rawAddress = data?.address;
  const address: string = typeof rawAddress === 'string' ? rawAddress : (data?.streetAddress || rawAddress?.streetAddress || rawAddress?.address || 'Address unavailable');
  const city = [data?.city || rawAddress?.city || '', data?.state || rawAddress?.state || '', data?.zipcode || rawAddress?.zipcode || ''].filter(Boolean).join(', ').replace(', ,', ',');
  const beds = data?.beds ?? data?.bedrooms ?? '-';
  const baths = data?.baths ?? data?.bathrooms ?? '-';
  const sqft = data?.livingArea ?? data?.sqft ?? null;
  const lat = data?.latitude ?? data?.lat;
  const lng = data?.longitude ?? data?.lng;
  const images: string[] = Array.isArray(data?.photos) && data?.photos.length > 0 ? data.photos : (data?.imgSrc ? [data.imgSrc] : []);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-0 md:inset-6 bg-white rounded-none md:rounded-xl overflow-y-auto focus:outline-none">
          <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-between">
            <div className="font-semibold">{priceFmt} • {beds} bd • {baths} ba {sqft ? `• ${new Intl.NumberFormat('en-US').format(sqft)} sqft` : ''}</div>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></Dialog.Close>
          </div>
          <div className="p-4 max-w-[1200px] mx-auto">
            {loading && <div className="h-40" />}
            {!loading && (
              <>
                <div className="mb-6">
                  <ImageGallery images={images} propertyAddress={address} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h1 className="text-2xl font-bold">{address}</h1>
                    <div className="text-gray-700">{city}</div>
                    {lat && lng && (
                      <div className="rounded overflow-hidden border">
                        <MapView center={{ lat: Number(lat), lng: Number(lng) }} zoom={14} className="w-full h-[300px]" />
                      </div>
                    )}
                    {priceNum && (
                      <div className="mt-2">
                        <PaymentBreakdown homePrice={priceNum} downPayment={Math.round(priceNum * 0.2)} interestRate={6.5} loanTerm={30} />
                      </div>
                    )}
                  </div>
                  <div>
                    {/* Lead form could be placed here as well if desired */}
                    <div className="p-4 border rounded-lg bg-gray-50 text-sm text-gray-600">Click more homes to continue browsing. We'll prompt a quick registration on your 3rd home.</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
