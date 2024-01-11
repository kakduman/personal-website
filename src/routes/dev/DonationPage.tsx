import React, { useEffect } from 'react';

// Declare the PayPal object to satisfy TypeScript
declare global {
  interface Window { PayPal: any; }
}

const DonationPage: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.paypalobjects.com/donate/sdk/donate-sdk.js";
    script.onload = () => {
      if (window.PayPal) {
        window.PayPal.Donation.Button({
          env: 'production',
          hosted_button_id: '6NJAD4KW8V28U',
          image: {
            src: 'https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif',
            alt: 'Donate with PayPal button',
            title: 'PayPal - The safer, easier way to pay online!',
          },
        }).render('#donate-button');
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div id="donate-button-container">
      <div id="donate-button"></div>
    </div>
  );
};

export default DonationPage;
