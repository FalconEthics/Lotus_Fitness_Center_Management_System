import React, { useState, useMemo, useTransition, startTransition } from 'react';
import { motion } from 'framer-motion';
import { 
  HiSparkles, 
  HiCog6Tooth, 
  HiMagnifyingGlass,
  HiArrowUturnLeft,
  HiArrowUturnRight,
  HiBeaker
} from 'react-icons/hi2';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useSearchAndFilterQuery } from '../../hooks/useQueryParams';
import { useDebouncedValue, useSearchQuery } from '../../hooks/useDeferredValue';
import { useFormTransition } from '../../hooks/useTransition';
import { useOptimisticStateWithErrorHandling } from '../../hooks/useOptimisticState';
import { fadeInUp, staggerChildren } from '../../theme';

interface DemoItem {
  id: number;
  name: string;
  category: string;
  status: 'active' | 'pending' | 'inactive';
}

const initialItems: DemoItem[] = [
  { id: 1, name: 'useTransition Demo', category: 'React 19', status: 'active' },
  { id: 2, name: 'useDeferredValue Demo', category: 'React 19', status: 'active' },
  { id: 3, name: 'useOptimistic Demo', category: 'React 19', status: 'active' },
  { id: 4, name: 'Query Params Demo', category: 'State Management', status: 'active' },
  { id: 5, name: 'Lodash Integration', category: 'Utils', status: 'active' },
];

export const React19FeaturesDemo: React.FC = () => {
  // React 19-style state management
  const [isPending, startBasicTransition] = useTransition();
  const { isPending: isSubmitting, submitForm } = useFormTransition();
  
  // URL-based search and filters
  const {
    searchTerm,
    filters,
    updateSearch,
    updateFilter,
    clearFilters
  } = useSearchAndFilterQuery({
    category: 'All',
    status: 'All',
  });

  // Debounced search
  const { deferredQuery, isSearching } = useSearchQuery(searchTerm, 300);
  
  // Optimistic state for demonstrations
  const {
    state: optimisticItems,
    isOptimistic,
    addOptimistic,
    commit,
    rollback,
    error: optimisticError
  } = useOptimisticStateWithErrorHandling(
    initialItems,
    (current, update) => [...current, update],
    {
      timeout: 3000,
      onError: (error) => console.error('Optimistic update failed:', error)
    }
  );

  const [newItemName, setNewItemName] = useState('');

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    return optimisticItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(deferredQuery.toLowerCase()) ||
                           item.category.toLowerCase().includes(deferredQuery.toLowerCase());
      
      const matchesCategory = filters.category === 'All' || item.category === filters.category;
      const matchesStatus = filters.status === 'All' || item.status === filters.status;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [optimisticItems, deferredQuery, filters]);

  // Demo actions
  const handleTransitionDemo = () => {
    startBasicTransition(() => {
      // Simulate heavy computation
      const start = Date.now();
      while (Date.now() - start < 1000) {
        // Block for 1 second to demonstrate non-blocking behavior
      }
      console.log('Heavy computation completed!');
    });
  };

  const handleOptimisticDemo = () => {
    if (!newItemName.trim()) return;
    
    const optimisticItem: DemoItem = {
      id: Date.now(),
      name: newItemName,
      category: 'Demo',
      status: 'pending'
    };

    addOptimistic(optimisticItem);
    
    // Simulate API call
    setTimeout(() => {
      if (Math.random() > 0.3) {
        // Success
        commit({ ...optimisticItem, status: 'active' });
        setNewItemName('');
      } else {
        // Failure
        rollback(new Error('Simulated API failure'));
      }
    }, 2000);
  };

  const handleFormSubmissionDemo = () => {
    submitForm(
      async () => {
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Form submitted successfully!');
      },
      {
        onSuccess: () => alert('Form submitted!'),
        onError: (error) => alert(`Form submission failed: ${error.message}`)
      }
    );
  };

  const categories = ['All', ...Array.from(new Set(optimisticItems.map(item => item.category)))];
  const statuses = ['All', 'active', 'pending', 'inactive'];

  return (
    <motion.div
      variants={fadeInUp}
      className="max-w-6xl mx-auto p-6 space-y-8"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <HiSparkles className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">React 19 Features Demo</h1>
            <p className="text-neutral-600">Modern state management and performance optimizations</p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <motion.div
        variants={staggerChildren}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* useTransition Demo */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <HiCog6Tooth className="h-5 w-5" />
              useTransition
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Non-blocking state updates for heavy computations
            </p>
            <Button 
              onClick={handleTransitionDemo}
              disabled={isPending}
              loading={isPending}
              className="w-full"
            >
              {isPending ? 'Processing...' : 'Start Heavy Task'}
            </Button>
          </CardContent>
        </Card>

        {/* Search & Filters Demo */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <HiMagnifyingGlass className="h-5 w-5" />
              Deferred Search
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => updateSearch(e.target.value)}
              size="sm"
            />
            <div className="flex gap-2">
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="text-xs p-2 border rounded flex-1"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="text-xs p-2 border rounded flex-1"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            {(searchTerm || filters.category !== 'All' || filters.status !== 'All') && (
              <Button size="xs" variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Optimistic Updates Demo */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <HiBeaker className="h-5 w-5" />
              Optimistic Updates
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="New item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              size="sm"
            />
            <Button 
              onClick={handleOptimisticDemo}
              disabled={!newItemName.trim() || isOptimistic}
              className="w-full"
              size="sm"
            >
              {isOptimistic ? 'Adding...' : 'Add Item'}
            </Button>
            {optimisticError && (
              <p className="text-xs text-red-600">{optimisticError.message}</p>
            )}
            {isOptimistic && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                Optimistic Update
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Form Transition Demo */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Form Transitions</h3>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleFormSubmissionDemo}
              disabled={isSubmitting}
              loading={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </Button>
          </CardContent>
        </Card>

        {/* URL State Demo */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">URL State Management</h3>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-600 mb-2">
              Search and filters are synced with URL
            </p>
            <div className="bg-neutral-100 p-2 rounded text-xs font-mono break-all">
              {window.location.search || '(no params)'}
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items rendered:</span>
                <Badge variant="outline">{filteredItems.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Search status:</span>
                <Badge className={isSearching ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                  {isSearching ? 'Searching...' : 'Ready'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Transitions:</span>
                <Badge className={isPending ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                  {isPending ? 'Pending' : 'Idle'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Grid */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Filtered Results ({filteredItems.length} items)
          </h3>
        </CardHeader>
        <CardContent>
          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-neutral-600">Searching...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="p-4 border rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <h4 className="font-medium mb-2">{item.name}</h4>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <Badge 
                      className={`text-xs ${
                        item.status === 'active' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {filteredItems.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <p className="text-neutral-500">No items match your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};