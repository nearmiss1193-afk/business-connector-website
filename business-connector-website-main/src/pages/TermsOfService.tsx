export default function TermsOfService() {
  return (
    <div className="max-w-[900px] mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
      <p className="text-gray-600 mb-6">By using Central Florida Homes, you agree to these terms.</p>

      <div className="space-y-6 text-sm leading-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold">Use of the Site</h2>
          <p className="mt-2">You may use this site to browse listings and contact us about real estate services. Do not misuse the site or attempt to disrupt service.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">No Brokerage Agreement</h2>
          <p className="mt-2">Use of this site does not create a brokerage relationship. Any representation agreements will be executed separately.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Communications Consent</h2>
          <p className="mt-2">By submitting a request, you consent to receive calls, emails, and texts from us and our partners at the contact information you provide. Message frequency varies. Message & data rates may apply. Text STOP to opt out.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Third-Party Services</h2>
          <p className="mt-2">We may link to third-party sites and services; we are not responsible for their content or policies.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Disclaimers</h2>
          <p className="mt-2">Information is provided “as is” and may change without notice. We do not guarantee accuracy or availability.</p>
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
