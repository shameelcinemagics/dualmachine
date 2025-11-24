import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift, X, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Prize {
  id: string;
  name: string;
  prize_type: string;
  prize_value: number;
  probability: number;
}

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
  customerPhone?: string;
}

export const SpinWheel = ({ isOpen, onClose, customerPhone }: SpinWheelProps) => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPrizes();
    }
  }, [isOpen]);

  const loadPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('spin_wheel_prizes')
        .select('*')
        .eq('is_active', true)
        .order('probability', { ascending: false });

      if (error) throw error;
      setPrizes(data || []);
    } catch (error) {
      console.error('Error loading prizes:', error);
      toast.error('Failed to load prizes');
    }
  };

  const selectRandomPrize = (): Prize | null => {
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    const random = Math.random() * totalProbability;
    
    let cumulative = 0;
    for (const prize of prizes) {
      cumulative += prize.probability;
      if (random <= cumulative) {
        return prize;
      }
    }
    
    return prizes[0] || null;
  };

  const spin = async () => {
    if (isSpinning || prizes.length === 0) return;

    setIsSpinning(true);
    const selectedPrize = selectRandomPrize();
    
    if (!selectedPrize) {
      setIsSpinning(false);
      return;
    }

    // Calculate rotation - spin multiple times then land on selected prize
    const prizeIndex = prizes.indexOf(selectedPrize);
    const segmentAngle = 360 / prizes.length;
    const targetAngle = prizeIndex * segmentAngle;
    const spinRotations = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = rotation + (spinRotations * 360) + (360 - targetAngle);
    
    setRotation(finalRotation);

    // Wait for spin animation to complete
    setTimeout(async () => {
      setIsSpinning(false);
      setWonPrize(selectedPrize);
      setShowResult(true);

      // Record the spin attempt
      try {
        if (customerPhone) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          weekStart.setHours(0, 0, 0, 0);

          await supabase
            .from('spin_wheel_attempts')
            .insert({
              customer_phone: customerPhone,
              prize_id: selectedPrize.id,
              week_start: weekStart.toISOString().split('T')[0]
            });
        }
      } catch (error) {
        console.error('Error recording spin attempt:', error);
      }
    }, 3000);
  };

  const getSegmentColor = (index: number) => {
    const colors = [
      'from-red-400 to-red-600',
      'from-blue-400 to-blue-600', 
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-orange-400 to-orange-600'
    ];
    return colors[index % colors.length];
  };

  const formatPrizeText = (prize: Prize) => {
    if (prize.prize_type === 'loyalty_points') {
      return prize.prize_value === 0 ? 'Try Again!' : `${prize.prize_value} Points`;
    } else if (prize.prize_type === 'free_product') {
      return 'Free Item!';
    } else if (prize.prize_type === 'discount') {
      return `${prize.prize_value}% Off`;
    }
    return prize.name;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <Card className="relative p-8 max-w-md w-full mx-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
        >
          <X className="w-4 h-4" />
        </Button>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="wheel"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <Gift className="w-8 h-8 text-primary mr-2" />
                <h2 className="text-2xl font-bold text-primary">Spin to Win!</h2>
              </div>

              <div className="relative w-64 h-64 mx-auto mb-6">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary" />
                </div>

                {/* Wheel */}
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary/30">
                  <svg
                    className="w-full h-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
                    }}
                    viewBox="0 0 200 200"
                  >
                    {prizes.map((prize, index) => {
                      const segmentAngle = 360 / prizes.length;
                      const startAngle = index * segmentAngle;
                      const endAngle = (index + 1) * segmentAngle;
                      
                      const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180);
                      const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180);
                      
                      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                      
                      return (
                        <g key={prize.id}>
                          <path
                            d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                            className={`fill-current bg-gradient-to-r ${getSegmentColor(index)}`}
                            fill={`url(#gradient-${index})`}
                          />
                          <defs>
                            <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={index % 2 === 0 ? '#3B82F6' : '#EF4444'} />
                              <stop offset="100%" stopColor={index % 2 === 0 ? '#1E40AF' : '#DC2626'} />
                            </linearGradient>
                          </defs>
                          <text
                            x={100 + 60 * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                            y={100 + 60 * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-white text-xs font-bold"
                            fontSize="10"
                          >
                            {formatPrizeText(prize)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <Button
                onClick={spin}
                disabled={isSpinning}
                size="lg"
                className="w-full"
                variant="kiosk"
              >
                {isSpinning ? 'Spinning...' : 'SPIN NOW!'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-yellow-500 mr-2" />
                <h2 className="text-2xl font-bold text-primary">Congratulations!</h2>
              </div>

              <div className="mb-6">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-semibold mb-2">You won:</h3>
                <div className="text-2xl font-bold text-primary">{wonPrize?.name}</div>
                {wonPrize?.prize_type === 'loyalty_points' && wonPrize.prize_value > 0 && (
                  <p className="text-muted-foreground mt-2">
                    {wonPrize.prize_value} loyalty points have been added to your account!
                  </p>
                )}
              </div>

              <Button
                onClick={onClose}
                size="lg"
                className="w-full"
                variant="kiosk"
              >
                Continue Shopping
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};