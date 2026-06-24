import { ContentPage } from '@/components/content/content-page'

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      updated="June 2026"
      intro="This Privacy Policy explains how Fulltiime, a product of Glostarep Media Limited (“we”, “us”, “our”), collects, uses, and protects your information when you use our website and services."
    >
      <section>
        <h2>Information we collect</h2>
        <p>We collect the following types of information:</p>
        <ul>
          <li>
            <strong>Account information</strong> — when you register, we collect your name, email
            address, and a securely hashed password. If you sign in with Google, we receive your
            name and email address from your Google account.
          </li>
          <li>
            <strong>Usage data</strong> — pages you visit, features you use, and general activity,
            which helps us improve the product.
          </li>
          <li>
            <strong>Technical data</strong> — device, browser, and approximate location derived from
            your IP address, collected automatically.
          </li>
          <li>
            <strong>Content you submit</strong> — messages you post in chat and any feedback you send
            us.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use your information</h2>
        <ul>
          <li>To create and manage your account and keep you signed in.</li>
          <li>To provide, personalise, and improve our scores, news, and other features.</li>
          <li>To send you essential service messages such as email verification and security alerts.</li>
          <li>To keep the platform safe and to detect or prevent abuse.</li>
        </ul>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          We use cookies and similar technologies to keep you logged in (authentication tokens), to
          remember your preferences, and to understand how the site is used. You can control cookies
          through your browser settings, though some features may not work without them.
        </p>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          We rely on trusted third parties to operate Fulltiime, including sports data providers for
          live scores and statistics, Google for optional sign-in, and email delivery providers for
          account messages. These providers process data only as needed to deliver their service.
        </p>
      </section>

      <section>
        <h2>Data retention</h2>
        <p>
          We keep your information for as long as your account is active or as needed to provide our
          services. You may request deletion of your account at any time, after which we remove your
          personal data except where we are required to retain it by law.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information, and to object
          to or restrict certain processing. To exercise any of these rights, contact us using the
          details below.
        </p>
      </section>

      <section>
        <h2>Children&apos;s privacy</h2>
        <p>
          Fulltiime is not directed at children under 13, and we do not knowingly collect personal
          information from them. If you believe a child has provided us with personal data, please
          contact us and we will delete it.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the “Last
          updated” date above, and significant changes may be communicated to you directly.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>
          If you have questions about this policy or your data, email us at{' '}
          <a href="mailto:support@fulltiime.com">support@fulltiime.com</a>.
        </p>
      </section>
    </ContentPage>
  )
}
