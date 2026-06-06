import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-help-center-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="help-center">
      <header class="help-header">
        <span class="eyebrow">{{ language.t('support') }}</span>
        <h1>{{ language.t('helpCenter') }}</h1>
        <p>{{ language.t('findSolutions') }}</p>
      </header>

      <div class="help-content">
        <article class="help-article">
          <div class="article-icon">
            <span class="material-symbols-outlined">search</span>
          </div>
          <div class="article-text">
            <h2>{{ language.t('cantFindReservation') }}</h2>
            <p>{{ language.t('cantFindReservationDesc') }}</p>
            
            <div class="solution-steps">
              <h3>{{ language.t('tryTheseSteps') }}</h3>
              <ul>
                <li>
                  <strong>{{ language.t('checkOtherEmails') }}</strong> 
                  {{ language.t('checkOtherEmailsDesc') }}
                </li>
                <li>
                  <strong>{{ language.t('searchInbox') }}</strong> 
                  {{ language.t('searchInboxDesc') }}
                </li>
                <li>
                  <strong>{{ language.t('verifyAccount') }}</strong> 
                  {{ language.t('verifyAccountDesc') }}
                </li>
                <li>
                  <strong>{{ language.t('waitSync') }}</strong> 
                  {{ language.t('waitSyncDesc') }}
                </li>
              </ul>
            </div>
          </div>
        </article>

        <section class="faq-section">
          <h2>{{ language.t('faqTitle') }}</h2>
          <div class="faq-grid">
            <div class="faq-item">
              <h3>{{ language.t('faqCancelTitle') }}</h3>
              <p>{{ language.t('faqCancelDesc') }}</p>
            </div>
            <div class="faq-item">
              <h3>{{ language.t('faqChargeTitle') }}</h3>
              <p>{{ language.t('faqChargeDesc') }}</p>
            </div>
            <div class="faq-item">
              <h3>{{ language.t('faqContactHostTitle') }}</h3>
              <p>{{ language.t('faqContactHostDesc') }}</p>
            </div>
          </div>
        </section>

        <section class="contact-support">
          <div class="contact-card">
            <span class="material-symbols-outlined">support_agent</span>
            <h3>{{ language.t('stillNeedHelp') }}</h3>
            <p>{{ language.t('supportDesc') }}</p>
            <a href="mailto:oceanneaminata8@gmail.com,ysireoceanneaminata@gmail.com,obibogo@icloud.com" class="btn-primary">{{ language.t('contactSupport') }}</a>
          </div>
        </section>
      </div>

      <footer class="help-footer">
        <a routerLink="/bookings" class="btn-outline">{{ language.t('backToTrips') }}</a>
      </footer>
    </section>
  `,
  styles: [`
    .help-center { max-width: 900px; margin: 0 auto; padding: 80px 24px; }
    .help-header { text-align: center; margin-bottom: 64px; }
    .eyebrow { color: #ba0036; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 12px; }
    h1 { font-size: 3.5rem; font-weight: 900; margin: 0 0 16px; letter-spacing: -0.03em; }
    .help-header p { font-size: 1.25rem; color: #5c3f41; max-width: 600px; margin: 0 auto; line-height: 1.5; }

    .help-content { display: grid; gap: 64px; }

    .help-article { display: flex; gap: 32px; background: #fff; padding: 48px; border-radius: 32px; border: 1px solid #f0eded; box-shadow: 0 16px 48px rgba(0,0,0,0.05); }
    .article-icon { flex: 0 0 64px; height: 64px; background: #fdf2f2; color: #ba0036; border-radius: 20px; display: grid; place-items: center; }
    .article-icon span { font-size: 32px; }
    .article-text h2 { font-size: 2rem; font-weight: 800; margin: 0 0 16px; }
    .article-text p { font-size: 1.1rem; color: #5c3f41; line-height: 1.6; margin-bottom: 32px; }

    .solution-steps h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 20px; }
    .solution-steps ul { list-style: none; padding: 0; display: grid; gap: 20px; }
    .solution-steps li { position: relative; padding-left: 28px; line-height: 1.6; color: #1b1c1c; }
    .solution-steps li::before { content: "check_circle"; font-family: 'Material Symbols Outlined'; position: absolute; left: 0; top: 2px; color: #008558; font-size: 20px; }
    .solution-steps strong { font-weight: 800; }

    .faq-section h2 { font-size: 2.2rem; font-weight: 900; margin-bottom: 40px; text-align: center; }
    .faq-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; }
    .faq-item h3 { font-size: 1.15rem; font-weight: 800; margin-bottom: 12px; }
    .faq-item p { color: #5c3f41; line-height: 1.6; }
    .faq-item a { color: #ba0036; font-weight: 700; text-decoration: none; border-bottom: 2px solid transparent; transition: border-color 0.2s; }
    .faq-item a:hover { border-color: #ba0036; }

    .contact-support { margin-top: 32px; }
    .contact-card { background: #1b1c1c; color: #fff; border-radius: 32px; padding: 64px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .contact-card span { font-size: 48px; color: #ba0036; margin-bottom: 8px; }
    .contact-card h3 { font-size: 2rem; font-weight: 800; margin: 0; }
    .contact-card p { opacity: 0.8; font-size: 1.1rem; max-width: 400px; margin: 0 auto 16px; }
    .btn-primary { background: #ba0036; color: #fff; padding: 16px 40px; border-radius: 16px; font-weight: 800; text-decoration: none; transition: transform 0.2s; }
    .btn-primary:hover { transform: translateY(-4px); }

    .help-footer { margin-top: 64px; text-align: center; }
    .btn-outline { border: 2px solid #eadfdd; color: #1b1c1c; padding: 14px 32px; border-radius: 14px; font-weight: 800; text-decoration: none; transition: all 0.2s; }
    .btn-outline:hover { background: #f6f3f2; border-color: #f6f3f2; }

    @media (max-width: 768px) {
      .help-center { padding: 48px 20px; }
      .help-article { flex-direction: column; padding: 32px; gap: 24px; }
      .article-icon { flex: 0 0 56px; height: 56px; }
      h1 { font-size: 2.5rem; }
      .contact-card { padding: 40px 24px; }
      .article-text h2 { font-size: 1.6rem; }
      .faq-section h2 { font-size: 1.8rem; }
    }

    @media (max-width: 480px) {
      h1 { font-size: 2rem; }
      .help-header p { font-size: 1.1rem; }
      .article-text h2 { font-size: 1.4rem; }
      .article-text p { font-size: 1rem; }
      .contact-card h3 { font-size: 1.6rem; }
      .contact-card p { font-size: 1rem; }
      .btn-primary { width: 100%; text-align: center; }
    }
  `]
})
export class HelpCenterPage {
  protected readonly language = inject(LanguageService);
}
