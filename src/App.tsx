import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  History, 
  Sparkles, 
  Coffee, 
  Shirt, 
  ShoppingBag, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiKeyGuard } from './components/ApiKeyGuard';
import { generateMockup } from './services/gemini';

interface MockupHistoryItem {
  id: string;
  url: string;
  product: string;
  timestamp: number;
}

const PRODUCTS = [
  { id: 'mug', name: 'Coffee Mug', icon: Coffee },
  { id: 'tshirt', name: 'T-Shirt', icon: Shirt },
  { id: 'hoodie', name: 'Hoodie', icon: Shirt },
  { id: 'totebag', name: 'Tote Bag', icon: ShoppingBag },
  { id: 'phonecase', name: 'Phone Case', icon: Smartphone },
];

const SIZES = ['1K', '2K', '4K'] as const;

export default function App() {
  const [logo, setLogo] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0].id);
  const [selectedSize, setSelectedSize] = useState<typeof SIZES[number]>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<MockupHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerate = async () => {
    if (!logo) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const productName = PRODUCTS.find(p => p.id === selectedProduct)?.name || selectedProduct;
      const imageUrl = await generateMockup(logo, productName, selectedSize);
      
      if (imageUrl) {
        setGeneratedImage(imageUrl);
        const newItem: MockupHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          url: imageUrl,
          product: productName,
          timestamp: Date.now(),
        };
        setHistory(prev => [newItem, ...prev]);
      } else {
        setError("Failed to generate mockup. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during generation. Check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `mockup-${name}-${Date.now()}.png`;
    link.click();
  };

  return (
    <ApiKeyGuard>
      <div className="min-h-screen flex flex-col md:flex-row bg-surface">
        {/* Sidebar - History */}
        <aside className="w-full md:w-80 glass-panel border-r border-surface-container p-6 flex flex-col gap-6 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 cta-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">MockupAI</h1>
              <p className="text-xs text-on-surface-variant font-medium">Professional Mockups</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4 text-on-surface-variant">
              <History className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">History</span>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {history.length === 0 ? (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-surface-container rounded-2xl">
                    <ImageIcon className="w-8 h-8 text-surface-container mx-auto mb-2" />
                    <p className="text-xs text-on-surface-variant">Your generated mockups will appear here</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative bg-surface-container-lowest p-2 rounded-xl border border-surface-container hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setGeneratedImage(item.url)}
                    >
                      <img 
                        src={item.url} 
                        alt={item.product} 
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-on-surface">{item.product}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(item.url, item.product);
                          }}
                          className="p-1.5 hover:bg-surface-container rounded-full text-primary transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Controls */}
              <div className="space-y-8">
                {/* Logo Upload */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">1. Upload Logo</h2>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center
                      ${logo ? 'border-primary bg-primary/5' : 'border-surface-container hover:border-primary/50 hover:bg-surface-container/50'}
                    `}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    {logo ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img src={logo} alt="Logo Preview" className="max-h-full max-w-full object-contain drop-shadow-lg" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogo(null);
                          }}
                          className="absolute -top-4 -right-4 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-error hover:scale-110 transition-transform"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-on-surface-variant" />
                        </div>
                        <p className="font-bold text-on-surface">Drop your logo here</p>
                        <p className="text-sm text-on-surface-variant">or click to browse files</p>
                      </>
                    )}
                  </div>
                </section>

                {/* Product Selection */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">2. Select Product</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRODUCTS.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product.id)}
                        className={`
                          flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all
                          ${selectedProduct === product.id 
                            ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                            : 'border-surface-container bg-white text-on-surface-variant hover:border-primary/30'}
                        `}
                      >
                        <product.icon className={`w-6 h-6 ${selectedProduct === product.id ? 'text-primary' : 'text-on-surface-variant'}`} />
                        <span className="text-xs font-bold">{product.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Size Selection */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">3. Image Quality</h2>
                  <div className="flex gap-3">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`
                          flex-1 py-3 rounded-xl border font-bold text-sm transition-all
                          ${selectedSize === size 
                            ? 'border-primary bg-primary text-white shadow-md' 
                            : 'border-surface-container bg-white text-on-surface-variant hover:border-primary/30'}
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </section>

                <button
                  disabled={!logo || isGenerating}
                  onClick={handleGenerate}
                  className={`
                    w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl
                    ${!logo || isGenerating 
                      ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' 
                      : 'cta-gradient text-white hover:scale-[1.02] active:scale-[0.98] shadow-primary/30'}
                  `}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating Mockup...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Generate Mockup
                    </>
                  )}
                </button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center gap-3 text-error"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </motion.div>
                )}
              </div>

              {/* Right Column: Preview */}
              <div className="relative">
                <div className="sticky top-10">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">Preview</h2>
                  <div className="aspect-square rounded-[2.5rem] bg-surface-container overflow-hidden shadow-2xl border-8 border-white relative group">
                    <AnimatePresence mode="wait">
                      {isGenerating ? (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-surface-container"
                        >
                          <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Creating your mockup...</h3>
                          <p className="text-sm text-on-surface-variant">Gemini is placing your logo with professional lighting and textures.</p>
                        </motion.div>
                      ) : generatedImage ? (
                        <motion.div
                          key="image"
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative w-full h-full"
                        >
                          <img 
                            src={generatedImage} 
                            alt="Generated Mockup" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => downloadImage(generatedImage, selectedProduct)}
                              className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-primary hover:scale-110 transition-transform"
                            >
                              <Download className="w-6 h-6" />
                            </button>
                          </div>
                          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-on-surface">Mockup Ready</span>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
                          <ImageIcon className="w-20 h-20 mb-6 opacity-20" />
                          <h3 className="text-lg font-bold mb-2">No Mockup Yet</h3>
                          <p className="text-sm">Upload a logo and click generate to see the magic happen.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ApiKeyGuard>
  );
}
