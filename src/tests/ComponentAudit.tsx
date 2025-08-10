import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiCheckCircle, 
  HiExclamationTriangle, 
  HiXCircle, 
  HiBeaker,
  HiChartBarSquare,
  HiSparkles
} from 'react-icons/hi2';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { auditComponent, generateAuditReport, type ComponentAuditResult } from '../utils/componentTesting';
import { fadeInUp, staggerChildren } from '../theme';

// Mock component code for testing (in real app, these would be loaded dynamically)
const MOCK_COMPONENTS = {
  'Dashboard': {
    code: `
import React from 'react';
import { motion } from 'framer-motion';
import { useDeviceType } from '../utils/responsive';

export function Dashboard(): JSX.Element {
  const { isMobile } = useDeviceType();
  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="p-4 bg-white rounded-lg shadow-md focus:ring-2">
        {/* Content */}
      </div>
    </motion.div>
  );
}`,
    html: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-white rounded-lg shadow-md focus:ring-2">`
  },
  'MemberCard': {
    code: `
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface MemberCardProps {
  member: Member;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const memberData = useMemo(() => member, [member]);
  
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg sm:p-4 md:p-6"
      whileHover={{ y: -2 }}
      aria-label="Member card"
    >
      <h3 className="text-lg font-semibold text-neutral-900">{member.name}</h3>
    </motion.div>
  );
}`,
    html: `<div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg sm:p-4 md:p-6" aria-label="Member card"><h3 class="text-lg font-semibold text-neutral-900"></h3></div>`
  },
  'Button': {
    code: `
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  disabled = false, 
  onClick 
}) => {
  return (
    <motion.button
      className={\`px-4 py-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-red-500 \${
        variant === 'primary' ? 'bg-red-600 text-white hover:bg-red-700' : 
        'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
      } \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {children}
    </motion.button>
  );
}`,
    html: `<button class="px-4 py-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-red-500 bg-red-600 text-white hover:bg-red-700"></button>`
  },
  'Navigation': {
    code: `
import React, { useState } from 'react';
import { NavLink } from 'react-router';

export function Navigation(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="bg-white border-b border-neutral-200 px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="hidden sm:block">
        <h1 className="text-lg font-semibold text-neutral-900">Lotus Fitness Center</h1>
      </div>
      <button 
        className="md:hidden focus:ring-2 focus:ring-red-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        Menu
      </button>
    </nav>
  );
}`,
    html: `<nav class="bg-white border-b border-neutral-200 px-4 lg:px-6 h-16 flex items-center justify-between"><button class="md:hidden focus:ring-2 focus:ring-red-500" aria-label="Toggle menu">Menu</button></nav>`
  },
  'StatCard': {
    code: `
import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow sm:p-4 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className={\`p-3 rounded-lg bg-\${color}-100\`}>
          <Icon className={\`h-6 w-6 text-\${color}-600\`} />
        </div>
      </div>
    </motion.div>
  );
}`,
    html: `<div class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow sm:p-4 md:p-6"><div class="flex items-center justify-between"><p class="text-sm font-medium text-neutral-600"></p><p class="text-2xl font-bold text-neutral-900"></p></div></div>`
  }
};

export const ComponentAudit: React.FC = () => {
  const [audits, setAudits] = useState<ComponentAuditResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<ReturnType<typeof generateAuditReport> | null>(null);

  const runAudit = async () => {
    setIsRunning(true);
    const results: ComponentAuditResult[] = [];
    
    // Simulate async audit process
    for (const [name, component] of Object.entries(MOCK_COMPONENTS)) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing time
      const result = auditComponent(name, component.code, component.html);
      results.push(result);
      setAudits([...results]); // Update progressively
    }
    
    const auditReport = generateAuditReport(results);
    setReport(auditReport);
    setIsRunning(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return HiCheckCircle;
    if (score >= 60) return HiExclamationTriangle;
    return HiXCircle;
  };

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="max-w-6xl mx-auto p-6 space-y-8"
    >
      <motion.div variants={fadeInUp} className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <HiBeaker className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Component Audit</h1>
            <p className="text-neutral-600">Testing design consistency and code quality</p>
          </div>
        </div>
        
        <Button
          onClick={runAudit}
          disabled={isRunning}
          loading={isRunning}
          className="gap-2"
        >
          <HiSparkles className="h-4 w-4" />
          {isRunning ? 'Running Audit...' : 'Start Component Audit'}
        </Button>
      </motion.div>

      {/* Overall Report */}
      {report && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <HiChartBarSquare className="h-5 w-5" />
                Audit Summary
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(report.overallScore).split(' ')[0]}`}>
                    {report.overallScore}
                  </div>
                  <p className="text-sm text-neutral-600">Overall Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neutral-900 mb-1">
                    {report.totalComponents}
                  </div>
                  <p className="text-sm text-neutral-600">Components Tested</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {report.highScoreComponents}
                  </div>
                  <p className="text-sm text-neutral-600">High Quality</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {report.needsImprovementComponents}
                  </div>
                  <p className="text-sm text-neutral-600">Need Improvement</p>
                </div>
              </div>
              
              {report.commonIssues.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Common Issues</h3>
                  <div className="space-y-2">
                    {report.commonIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                        <HiExclamationTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-neutral-600">
                      <HiCheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Individual Component Results */}
      {audits.length > 0 && (
        <motion.div variants={fadeInUp}>
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Component Results</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {audits.map((audit) => {
              const ScoreIcon = getScoreIcon(audit.score);
              return (
                <motion.div
                  key={audit.componentName}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-neutral-900">{audit.componentName}</h3>
                        <Badge className={getScoreColor(audit.score)}>
                          <ScoreIcon className="h-4 w-4 mr-1" />
                          {audit.score}/100
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Passes */}
                      {audit.passes.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                            <HiCheckCircle className="h-4 w-4" />
                            Passes ({audit.passes.length})
                          </h4>
                          <div className="space-y-1">
                            {audit.passes.map((pass, index) => (
                              <div key={index} className="text-xs text-green-600 pl-5">
                                • {pass}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Warnings */}
                      {audit.warnings.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center gap-1">
                            <HiExclamationTriangle className="h-4 w-4" />
                            Warnings ({audit.warnings.length})
                          </h4>
                          <div className="space-y-1">
                            {audit.warnings.map((warning, index) => (
                              <div key={index} className="text-xs text-yellow-600 pl-5">
                                • {warning}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Errors */}
                      {audit.errors.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                            <HiXCircle className="h-4 w-4" />
                            Errors ({audit.errors.length})
                          </h4>
                          <div className="space-y-1">
                            {audit.errors.map((error, index) => (
                              <div key={index} className="text-xs text-red-600 pl-5">
                                • {error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {audit.passes.length === 0 && audit.warnings.length === 0 && audit.errors.length === 0 && (
                        <p className="text-sm text-neutral-500 italic">No issues found</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isRunning && audits.length === 0 && (
        <motion.div variants={fadeInUp} className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Analyzing components...</p>
        </motion.div>
      )}
    </motion.div>
  );
};