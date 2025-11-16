import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Flag } from "lucide-react";

interface ReportPropertyDialogProps {
  propertyId: number;
  mlsId: string;
  address: string;
}

export function ReportPropertyDialog({ propertyId, mlsId, address }: ReportPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");

  const submitReport = trpc.propertyReports.submitReport.useMutation({
    onSuccess: () => {
      toast.success("Thank you! Your report has been submitted and will be reviewed.");
      setOpen(false);
      // Reset form
      setReportType("");
      setDescription("");
      setReporterName("");
      setReporterEmail("");
      setReporterPhone("");
    },
    onError: (error) => {
      toast.error(`Failed to submit report: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!reportType) {
      toast.error("Please select a report type");
      return;
    }

    if (description.length < 10) {
      toast.error("Please provide more details (at least 10 characters)");
      return;
    }

    submitReport.mutate({
      propertyId,
      mlsId,
      reportType: reportType as any,
      description,
      reporterName: reporterName || undefined,
      reporterEmail: reporterEmail || undefined,
      reporterPhone: reporterPhone || undefined,
    });
  };

  const reportTypes = [
    { value: "sold", label: "Property has been sold" },
    { value: "off_market", label: "Property is off market" },
    { value: "wrong_price", label: "Price is incorrect" },
    { value: "wrong_details", label: "Beds, baths, or sqft are wrong" },
    { value: "wrong_address", label: "Address is incorrect" },
    { value: "duplicate", label: "Duplicate listing" },
    { value: "spam", label: "Spam or fake listing" },
    { value: "other", label: "Other issue" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Flag className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report Property Issue</DialogTitle>
          <DialogDescription>
            Help us maintain accurate listings by reporting any issues with this property
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Property Info */}
          <div className="bg-muted p-3 rounded">
            <p className="font-medium text-sm">{address}</p>
            <p className="text-xs text-muted-foreground">MLS: {mlsId}</p>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="report-type">Issue Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{description.length}/1000 characters (min 10)</p>
          </div>

          {/* Optional Contact Info */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Contact Information (Optional)</Label>
            <Input
              placeholder="Your name"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Your email"
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
            />
            <Input
              type="tel"
              placeholder="Your phone"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Providing contact info helps us follow up if we need more information
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitReport.isPending || !reportType || description.length < 10}>
            {submitReport.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
