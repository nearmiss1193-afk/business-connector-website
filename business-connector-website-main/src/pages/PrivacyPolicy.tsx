export default function PrivacyPolicy() {
  return (
    <div className="max-w-[900px] mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Privacy Notice</h1>
      <p className="text-gray-600 mb-6">
        This Privacy Notice explains how we collect, use, share, and protect your information when you use Central Florida Homes services.
      </p>

      <div className="space-y-6 text-sm leading-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <ul className="list-disc ml-6 mt-2">
            <li>Contact information you provide (name, email, phone).</li>
            <li>Inquiry details (message, preferences).</li>
            <li>Usage data (IP, device, browser, pages viewed).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">How We Use Information</h2>
          <ul className="list-disc ml-6 mt-2">
            <li>Respond to your inquiries and provide services.</li>
            <li>Send updates about listings and market information.</li>
            <li>Improve our website and user experience.</li>
            <li>Comply with legal obligations and prevent misuse.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Sharing</h2>
          <p className="mt-2">We may share your information with trusted service providers and real estate partners solely to fulfill your requests and provide our services. We do not sell personal information.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Your Choices</h2>
          <ul className="list-disc ml-6 mt-2">
            <li>Opt out of marketing emails by using unsubscribe links.</li>
            <li>Text STOP to opt out of SMS; HELP for assistance.</li>
            <li>Contact us to request access, correction, or deletion of your data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Security</h2>
          <p className="mt-2">We maintain appropriate safeguards to protect your information. However, no system is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2">Questions? Contact us at info@centralfloridahomes.example</p>
        </section>

        <p className="text-gray-500 mt-8">Updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
