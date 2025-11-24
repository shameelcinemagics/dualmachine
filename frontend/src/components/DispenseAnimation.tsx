import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Package, Instagram, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import instagramQR from '@/assets/instagram-qr.png';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface DispenseAnimationProps {
  isVisible: boolean;
  items: CartItem[];
  onComplete: () => void;
}

export const DispenseAnimation = ({ isVisible, items, onComplete }: DispenseAnimationProps) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [timeoutSeconds, setTimeoutSeconds] = useState(10);

  useEffect(() => {
    console.log("DispenseAnimation useEffect - isVisible:", isVisible, "items:", items);
    if (!isVisible) {
      setCurrentItemIndex(0);
      setShowSuccess(false);
      setShowFeedback(false);
      setSelectedRating(null);
      setShowCommentBox(false);
      setComment('');
      setTimeoutSeconds(10);
      return;
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    console.log("Total items to dispense:", totalItems, "Current index:", currentItemIndex);
    
    if (currentItemIndex < totalItems) {
      console.log("Setting timer for next item");
      const timer = setTimeout(() => {
        console.log("Timer fired, incrementing from", currentItemIndex, "to", currentItemIndex + 1);
        setCurrentItemIndex(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentItemIndex >= totalItems && !showSuccess && !showFeedback) {
      console.log("All items dispensed, showing success");
      const timer = setTimeout(() => {
        setShowSuccess(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (showSuccess && !showFeedback) {
      console.log("Success shown, moving to feedback");
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowFeedback(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, currentItemIndex, items, onComplete, showSuccess, showFeedback]);

  // 10-second timeout for feedback screen
  useEffect(() => {
    if (!showFeedback || selectedRating) return;

    console.log("Starting 10-second timeout for feedback screen");
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeoutSeconds(prev => {
        if (prev <= 1) {
          console.log("Feedback timeout reached, refreshing website");
          onComplete();
          // Refresh the entire website after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [showFeedback, selectedRating, onComplete]);

  // Create an array of individual items for animation
  const individualItems = items.flatMap(item => 
    Array(item.quantity).fill(item)
  );

  const currentItem = individualItems[currentItemIndex - 1];

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    if (rating === 1) {
      // Show comment box for negative feedback
      setShowCommentBox(true);
    } else {
      // For good/okay ratings, refresh after showing feedback
      setTimeout(() => {
        onComplete();
        window.location.reload();
      }, 1500);
    }
  };

  const handleCommentSubmit = () => {
    console.log('User feedback:', comment);
    setTimeout(() => {
      onComplete();
      window.location.reload();
    }, 1000);
  };

  const ratingEmojis = ['😞', '😐', '😊'];
  const ratingLabels = ['Not Great', 'Okay', 'Great!'];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex flex-col items-center justify-center"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/20 rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  opacity: 0 
                }}
                animate={{ 
                  y: window.innerHeight + 20,
                  opacity: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

          {/* Timeout Indicator */}
          {showFeedback && !selectedRating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-6 right-6 bg-muted/80 rounded-full px-4 py-2 text-sm font-medium"
            >
              Auto-continue in {timeoutSeconds}s
            </motion.div>
          )}

          {/* Main Content */}
          <div className="relative z-10 text-center">
            {showFeedback ? (
              /* Feedback Screen */
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-center max-w-md mx-auto"
              >
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl font-bold text-foreground mb-6"
                >
                  Thank you! 🙏
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-muted-foreground mb-8"
                >
                  How was your experience?
                </motion.p>

                {/* Rating Buttons */}
                <div className="flex justify-center gap-4 mb-8">
                  {ratingEmojis.map((emoji, index) => (
                    <motion.button
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRatingClick(index + 1)}
                      className={`p-4 rounded-full text-6xl transition-all duration-200 ${
                        selectedRating === index + 1 
                          ? 'bg-primary/20 ring-4 ring-primary' 
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>

                {selectedRating && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-primary font-semibold mb-6"
                  >
                    {ratingLabels[selectedRating - 1]}
                  </motion.p>
                )}

                {/* Comment Box for Negative Feedback */}
                {showCommentBox && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/30 rounded-lg p-6 mb-6"
                  >
                    <h4 className="text-lg font-semibold mb-4 text-foreground">
                      Help us improve! 💡
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      What went wrong and how can we make it better?
                    </p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us what happened and how we can improve..."
                      className="w-full h-24 p-3 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={handleCommentSubmit}
                      className="mt-4 w-full"
                      disabled={!comment.trim()}
                    >
                      Submit Feedback
                    </Button>
                  </motion.div>
                )}

                {/* Instagram Follow */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-muted/30 rounded-lg p-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Instagram className="w-6 h-6 text-pink-500" />
                    <h3 className="text-xl font-semibold">Follow us on Instagram!</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    Get exclusive deals and healthy tips
                  </p>
                  
                  <img 
                    src={instagramQR} 
                    alt="Instagram QR Code" 
                    className="w-24 h-24 mx-auto rounded border border-border/30"
                  />
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Scan to follow @vendit
                  </p>
                </motion.div>

                {!selectedRating && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-sm text-muted-foreground mt-4"
                  >
                    Tap a smiley to continue or wait {timeoutSeconds}s
                  </motion.p>
                )}
              </motion.div>
            ) : !showSuccess ? (
              <>
                {/* Dispensing Machine Animation */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-8"
                >
                  <div className="relative">
                    <Package className="w-32 h-32 text-primary mx-auto" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-full"
                    />
                  </div>
                </motion.div>

                {/* Dispensing Text */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl font-bold text-primary mb-4"
                >
                  Dispensing Your Items...
                </motion.h1>

                {/* Progress */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-muted-foreground mb-8"
                >
                  Item {currentItemIndex} of {individualItems.length}
                </motion.p>

                {/* Current Item Animation */}
                <AnimatePresence mode="wait">
                  {currentItem && (
                    <motion.div
                      key={currentItemIndex}
                      initial={{ y: -100, opacity: 0, scale: 0.5 }}
                      animate={{ 
                        y: 0, 
                        opacity: 1, 
                        scale: 1
                      }}
                      exit={{ y: 100, opacity: 0, scale: 0.5 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      className="mx-auto"
                    >
                      <div className="relative">
                        <motion.img
                          src={currentItem.image}
                          alt={currentItem.name}
                          className="w-32 h-32 object-cover rounded-xl shadow-xl mx-auto"
                          animate={{ 
                            boxShadow: [
                              "0 10px 30px rgba(0,0,0,0.2)",
                              "0 20px 40px rgba(0,0,0,0.3)",
                              "0 10px 30px rgba(0,0,0,0.2)"
                            ],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            boxShadow: { duration: 1, repeat: Infinity },
                            rotate: { duration: 2, repeat: Infinity, type: "tween" }
                          }}
                        />
                        
                        {/* Falling Effect */}
                        <motion.div
                          className="absolute inset-0 bg-primary/10 rounded-xl"
                          animate={{ 
                            opacity: [0, 0.5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                      
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-semibold mt-4 text-foreground"
                      >
                        {currentItem.name}
                      </motion.h3>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="w-64 mx-auto mt-8">
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentItemIndex / individualItems.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Success Animation */
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                  className="mb-6"
                >
                  <CheckCircle className="w-32 h-32 text-success mx-auto" />
                </motion.div>
                
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold text-success mb-4"
                >
                  Enjoy Your Items!
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-muted-foreground"
                >
                  Thank you for your purchase!
                </motion.p>

                {/* Confetti Effect */}
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-success rounded"
                    initial={{ 
                      x: window.innerWidth / 2,
                      y: window.innerHeight / 2,
                      opacity: 1
                    }}
                    animate={{ 
                      x: window.innerWidth / 2 + (Math.random() - 0.5) * 400,
                      y: window.innerHeight / 2 + (Math.random() - 0.5) * 400,
                      opacity: 0,
                      rotate: Math.random() * 360
                    }}
                    transition={{
                      duration: 1.5,
                      delay: Math.random() * 0.5
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};