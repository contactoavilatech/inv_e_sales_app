import './globals.css';

export const metadata = {
  title: 'AvilaTech ERP | Inventory & Sales',
  description: 'Enterprise Inventory, Barcode POS & Operations',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}