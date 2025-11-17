import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ImageGallery from "@/components/ImageGallery";
import PaymentBreakdown from "@/components/PaymentBreakdown";
import { MapView } from "@/components/Map";

export default function PropertyDetailsModal({ open, onOpenChange, zpid }: { open: boolean; onOpenChange: (v: boolean) => void; zpid: string | null }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);

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

  // Derived details with safe fallbacks
  const homeType = data?.homeType || data?.propertyType || data?.resoFacts?.propertySubType || undefined;
  const yearBuilt = data?.yearBuilt || data?.resoFacts?.yearBuilt || undefined;
  const lotAreaValue = data?.lotAreaValue || data?.lotArea || data?.resoFacts?.lotSize || undefined;
  const lotAreaUnits = data?.lotAreaUnit || data?.lotAreaUnits || (typeof lotAreaValue === 'string' && lotAreaValue.includes('sqft') ? 'sqft' : undefined);
  const hoaFee = data?.hoaFee || data?.hoaFeeTotal || undefined;
  const daysOnZillow = data?.daysOnZillow || data?.timeOnZillow || undefined;
  const pricePerSqft = (data?.pricePerSquareFoot || data?.pricePerSqft || (priceNum && sqft ? Math.round(priceNum / sqft) : undefined)) as number | undefined;
  const description: string | undefined = data?.description || data?.homeDescription || data?.hdpData?.homeInfo?.description;

  const features = useMemo(() => {
    const collect = (v: any): string[] => {
      if (!v) return [];
      if (Array.isArray(v)) {
        return v
          .filter(Boolean)
          .map((x) => {
            if (typeof x === 'string') return x;
            if (typeof x === 'object' && x) {
              const cand = (x as any).text || (x as any).name || (x as any).label || (x as any).value;
              return cand ? String(cand) : '';
            }
            return '';
          })
          .filter(Boolean);
      }
      if (typeof v === 'string') return [v];
      return [];
    };
    const rf = data?.resoFacts || {};
    const interior = collect(rf.interiorFeatures);
    const exterior = collect(rf.exteriorFeatures);
    const appliances = collect(rf.appliances);
    const other = collect(rf.otherFacts);
    const heating = collect(rf.heating);
    const cooling = collect(rf.cooling);
    const parking = collect(rf.parking);
    const amenities = [...interior, ...exterior, ...appliances, ...other, ...heating, ...cooling, ...parking];
    return Array.from(new Set(amenities.map((s) => s.trim()))).slice(0, 40);
  }, [data]);

  const rooms = useMemo(() => {
    const rf = data?.resoFacts || {};
    const r = rf?.rooms || rf?.roomCount || [];
    if (Array.isArray(r)) return r.map((x) => String(x));
    if (typeof r === 'number') return [`${r} rooms`];
    if (typeof r === 'string') return [r];
    return [];
  }, [data]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-0 md:inset-6 bg-white rounded-none md:rounded-xl overflow-y-auto focus:outline-none">
          <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-between">
            <Dialog.Title className="font-semibold">{priceFmt} • {beds} bd • {baths} ba {sqft ? `• ${new Intl.NumberFormat('en-US').format(sqft)} sqft` : ''}</Dialog.Title>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Full property details including photos, map, payment breakdown, features and rooms.</Dialog.Description>
          <div className="p-4 max-w-[1200px] mx-auto">
            {loading && <div className="h-40" />}
            {!loading && (
              <>
                <div className="mb-6">
                  <ImageGallery images={images} propertyAddress={address} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold">{address}</h1>
                      <div className="text-gray-700">{city}</div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {homeType && <div className="border rounded p-3"><div className="text-gray-500">Type</div><div className="font-medium">{homeType}</div></div>}
                      {yearBuilt && <div className="border rounded p-3"><div className="text-gray-500">Year built</div><div className="font-medium">{yearBuilt}</div></div>}
                      {pricePerSqft && <div className="border rounded p-3"><div className="text-gray-500">Price/sqft</div><div className="font-medium">${new Intl.NumberFormat('en-US').format(pricePerSqft)}</div></div>}
                      {lotAreaValue && <div className="border rounded p-3"><div className="text-gray-500">Lot size</div><div className="font-medium">{typeof lotAreaValue === 'number' ? `${new Intl.NumberFormat('en-US').format(lotAreaValue)} ${lotAreaUnits || ''}` : String(lotAreaValue)}</div></div>}
                      {hoaFee && <div className="border rounded p-3"><div className="text-gray-500">HOA</div><div className="font-medium">{typeof hoaFee === 'number' ? `$${new Intl.NumberFormat('en-US').format(hoaFee)}` : String(hoaFee)}</div></div>}
                      {daysOnZillow && <div className="border rounded p-3"><div className="text-gray-500">Days on site</div><div className="font-medium">{String(daysOnZillow)}</div></div>}
                    </div>

                    {description && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Overview</h2>
                        <p className="text-gray-800 whitespace-pre-line">
                          {showFullDesc ? description : description.slice(0, 600)}{!showFullDesc && description.length > 600 ? '…' : ''}
                        </p>
                        {description.length > 600 && (
                          <button onClick={() => setShowFullDesc((v) => !v)} className="mt-2 text-blue-700 hover:underline text-sm">
                            {showFullDesc ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    )}

                    {lat && lng && (
                      <div className="rounded overflow-hidden border">
                        <MapView
                          center={{ lat: Number(lat), lng: Number(lng) }}
                          zoom={14}
                          className="w-full h-[300px]"
                          markers={[{ id: zpid ?? "subject", lat: Number(lat), lng: Number(lng), label: address }]}
                        />
                      </div>
                    )}
                    {priceNum && (
                      <div className="mt-2">
                        <PaymentBreakdown homePrice={priceNum} downPayment={Math.round(priceNum * 0.2)} interestRate={6.5} loanTerm={30} />
                      </div>
                    )}

                    {features.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Features</h2>
                        <div className="flex flex-wrap gap-2">
                          {features.map((f: string, i: number) => (
                            <span key={i} className="text-xs bg-gray-100 border rounded px-2 py-1">{f}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rooms.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Rooms</h2>
                        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                          {rooms.map((r: string, i: number) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
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
