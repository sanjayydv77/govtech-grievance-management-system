import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Shield } from 'lucide-react';

const DEPARTMENTS = [
  'Public Works Department (PWD)',
  'Delhi Jal Board (DJB)',
  'Municipal Corporation of Delhi (MCD)',
  'BSES Rajdhani Power Limited',
  'Department of Health'
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!selectedDept) return;
    
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      // Mock officer data
      const officerData = {
        name: 'Officer Amit',
        department: selectedDept,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Officer+Amit&backgroundColor=0f172a`
      };
      
      localStorage.setItem('officerSession', JSON.stringify(officerData));
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-primary/10">
        <CardHeader className="space-y-4 items-center text-center pb-8">
          <div className="bg-primary/10 text-primary p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-2">
            <Shield size={32} />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">GovTech Portal</CardTitle>
            <CardDescription className="text-base mt-2">Sign in to your Officer Dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Department
            </label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-12 text-base font-semibold" 
            onClick={handleLogin}
            disabled={!selectedDept || isLoading}
          >
            {isLoading ? 'Signing in...' : 'Access Dashboard'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
