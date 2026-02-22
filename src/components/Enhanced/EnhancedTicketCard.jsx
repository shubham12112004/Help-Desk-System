import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Filter, Clock, AlertCircle, Loader2, Eye, 
  MessageSquare, User, Building2, CheckCircle, AlertTriangle,
  Zap, TrendingUp, Inbox, Archive
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = [
  { value: 'medical', label: '🏥 Medical', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { value: 'billing', label: '💳 Billing', color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
  { value: 'technical', label: '💻 Technical', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  { value: 'appointment', label: '📅 Appointment', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  { value: 'emergency', label: '🚨 Emergency', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', icon: '⬇️', color: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300' },
  { value: 'medium', label: 'Medium', icon: '→', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { value: 'high', label: 'High', icon: '⬆️', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  { value: 'urgent', label: 'Urgent', icon: '🔴', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  { value: 'critical', label: 'Critical', icon: '🔥', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' },
];

const STATUSES = [
  { value: 'open', label: 'Open', icon: '📌', color: 'bg-blue-100' },
  { value: 'assigned', label: 'Assigned', icon: '👤', color: 'bg-purple-100' },
  { value: 'in_progress', label: 'In Progress', icon: '⚙️', color: 'bg-yellow-100' },
  { value: 'resolved', label: 'Resolved', icon: '✅', color: 'bg-green-100' },
  { value: 'closed', label: 'Closed', icon: '📁', color: 'bg-gray-100' },
];

export function EnhancedTicketCard({ tickets = [], onRefresh }) {
  const { user } = useAuth();
  const [filteredTickets, setFilteredTickets] = useState(tickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    let filtered = tickets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };
      filtered.sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, filterStatus, filterCategory, sortBy]);

  const getCategoryColor = (category) => {
    return CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    return PRIORITY_LEVELS.find(p => p.value === priority)?.color || 'bg-gray-100';
  };

  const getStatusIcon = (status) => {
    return STATUSES.find(s => s.value === status)?.icon || '📌';
  };

  const getStatusColor = (status) => {
    return STATUSES.find(s => s.value === status)?.color || 'bg-gray-100';
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Tickets</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{tickets.length}</p>
            </div>
            <Inbox className="h-6 w-6 text-blue-600 dark:text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Open</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-1">{openTickets}</p>
            </div>
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">In Progress</p>
              <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{inProgressTickets}</p>
            </div>
            <Loader2 className="h-6 w-6 text-yellow-600 dark:text-yellow-400 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Resolved</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">{resolvedTickets}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Create Ticket Button */}
      <Link to="/create" className="block">
        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="h-5 w-5 mr-2" />
          🎫 CREATE NEW TICKET
        </Button>
      </Link>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets by ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={showFilter} onOpenChange={setShowFilter}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Filter & Sort</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2">By Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.icon} {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2">By Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="priority">Priority (High First)</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setShowFilter(false)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Apply Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="block group"
            >
              <Card className="p-5 border-l-4 border-l-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-card via-card to-card/80 hover:from-primary/5 hover:via-card hover:to-primary/5 cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        #{ticket.ticket_number || ticket.id.slice(0, 8)}
                      </span>
                      <Badge className={`${getStatusColor(ticket.status)}/20 border border-current`}>
                        {getStatusIcon(ticket.status)} {ticket.status.toUpperCase().replace('_', ' ')}
                      </Badge>
                      {ticket.category && (
                        <Badge className={getCategoryColor(ticket.category)}>
                          {CATEGORIES.find(c => c.value === ticket.category)?.label}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-card-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 mb-1">
                      {ticket.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Priority Badge */}
                  <div className={`flex-shrink-0 px-3 py-2 rounded-lg ${getPriorityColor(ticket.priority)} font-bold whitespace-nowrap ml-3`}>
                    {PRIORITY_LEVELS.find(p => p.value === ticket.priority)?.icon} {ticket.priority?.toUpperCase()}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border/50 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {ticket.creator?.full_name || 'Anonymous'}
                  </span>

                  {ticket.department && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {ticket.department}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </span>

                  {ticket.comments && ticket.comments.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {ticket.comments.length}
                    </Badge>
                  )}

                  {ticket.assigned_to && (
                    <Badge className="ml-auto bg-primary/20 text-primary border border-primary/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Assigned
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed bg-gray-50 dark:bg-gray-900/50">
          <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <h3 className="font-semibold mb-1 text-lg">No Tickets Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || filterStatus || filterCategory
              ? 'Try adjusting your filters'
              : 'Create your first ticket to get started'}
          </p>
          <Link to="/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create First Ticket
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
