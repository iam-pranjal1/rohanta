import React, { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Crown, Star, Users, DollarSign, 
  TrendingUp, Sparkles, Award, Building2, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import api from '../utils/api';

const CompanyLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCompanies, setTotalCompanies] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/public/leaderboard?limit=10');
      setLeaderboard(response.data.leaderboard || []);
      setTotalCompanies(response.data.total_companies || 0);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-amber-400" />;
      case 2:
        return <Medal className="h-7 w-7 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getTierStyles = (tier, tierColor) => {
    const styles = {
      Diamond: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      Platinum: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
      Gold: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-indigo-950',
      Silver: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
      Bronze: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white'
    };
    return styles[tier] || 'bg-gray-200 text-gray-700';
  };

  const getRankBackground = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-amber-300';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-orange-200';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marigold mx-auto"></div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-amber-50" data-testid="leaderboard-section">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-6">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">CSR Champions</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-indigo-950 mb-4">
            Company Leaderboard
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Celebrating companies making the biggest impact in transforming student lives through CSR
          </p>
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          {/* Single Company Featured Card */}
          {leaderboard.length === 1 && (
            <div className="max-w-lg mx-auto mb-8">
              <Card className={`${getRankBackground(1)} border-2 overflow-hidden shadow-xl`}>
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 py-2 text-center">
                  <Sparkles className="h-5 w-5 text-white inline mr-1" />
                  <span className="text-white font-bold text-sm">FOUNDING CHAMPION</span>
                </div>
                <CardContent className="p-8 text-center">
                  <div className="mb-4">{getRankIcon(1)}</div>
                  <Badge className={getTierStyles(leaderboard[0].tier)}>
                    {leaderboard[0].tier}
                  </Badge>
                  <h3 className="font-bold text-2xl text-indigo-950 mt-4 mb-2">
                    {leaderboard[0].company_name}
                  </h3>
                  <p className="text-gray-500 mb-4">{leaderboard[0].industry}</p>
                  <div className="flex justify-center gap-8 text-sm mb-4">
                    <div>
                      <p className="font-bold text-indigo-600 text-2xl">{leaderboard[0].students_sponsored}</p>
                      <p className="text-xs text-gray-500">Students Sponsored</p>
                    </div>
                    <div>
                      <p className="font-bold text-emerald-600 text-2xl">{formatCurrency(leaderboard[0].total_funds)}</p>
                      <p className="text-xs text-gray-500">Funds Committed</p>
                    </div>
                  </div>
                  {leaderboard[0].success_stories > 0 && (
                    <div className="bg-emerald-50 rounded-lg py-2 px-4 inline-block">
                      <Award className="h-4 w-4 text-emerald-600 inline mr-1" />
                      <span className="text-sm text-emerald-700 font-medium">
                        {leaderboard[0].success_stories} Success {leaderboard[0].success_stories === 1 ? 'Story' : 'Stories'}
                      </span>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-3xl font-bold text-amber-600">{leaderboard[0].impact_score}</p>
                    <p className="text-xs text-gray-500">Impact Score</p>
                  </div>
                </CardContent>
              </Card>
              <p className="text-center text-gray-500 mt-4 text-sm">
                Be among the first companies to join our leaderboard!
              </p>
            </div>
          )}

          {/* Two Companies Layout */}
          {leaderboard.length === 2 && (
            <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
              {leaderboard.map((company, idx) => (
                <Card key={company.company_id} className={`${getRankBackground(idx + 1)} border-2 overflow-hidden`}>
                  {idx === 0 && (
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 py-2 text-center">
                      <Sparkles className="h-5 w-5 text-white inline mr-1" />
                      <span className="text-white font-bold text-sm">TOP CONTRIBUTOR</span>
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="mb-3">{getRankIcon(idx + 1)}</div>
                    <Badge className={getTierStyles(company.tier)}>{company.tier}</Badge>
                    <h3 className="font-bold text-lg text-indigo-950 mt-3 mb-1">{company.company_name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{company.industry}</p>
                    <div className="flex justify-center gap-4 text-sm">
                      <div>
                        <p className="font-bold text-indigo-600">{company.students_sponsored}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-600">{formatCurrency(company.total_funds)}</p>
                        <p className="text-xs text-gray-500">Funds</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-2xl font-bold text-gray-700">{company.impact_score}</p>
                      <p className="text-xs text-gray-500">Impact Score</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Top 3 Spotlight */}
          {leaderboard.length >= 3 && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* 2nd Place */}
              <div className="md:mt-8 order-1 md:order-1">
                <Card className={`${getRankBackground(2)} border-2 overflow-hidden`}>
                  <CardContent className="p-6 text-center">
                    <div className="mb-3">{getRankIcon(2)}</div>
                    <Badge className={getTierStyles(leaderboard[1].tier)}>
                      {leaderboard[1].tier}
                    </Badge>
                    <h3 className="font-bold text-lg text-indigo-950 mt-3 mb-1">
                      {leaderboard[1].company_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{leaderboard[1].industry}</p>
                    <div className="flex justify-center gap-4 text-sm">
                      <div>
                        <p className="font-bold text-indigo-600">{leaderboard[1].students_sponsored}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-600">{formatCurrency(leaderboard[1].total_funds)}</p>
                        <p className="text-xs text-gray-500">Funds</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-2xl font-bold text-gray-700">{leaderboard[1].impact_score}</p>
                      <p className="text-xs text-gray-500">Impact Score</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 1st Place */}
              <div className="order-0 md:order-2">
                <Card className={`${getRankBackground(1)} border-2 overflow-hidden transform md:scale-105 shadow-xl`}>
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 py-2 text-center">
                    <Sparkles className="h-5 w-5 text-white inline mr-1" />
                    <span className="text-white font-bold text-sm">TOP CONTRIBUTOR</span>
                  </div>
                  <CardContent className="p-6 text-center">
                    <div className="mb-3">{getRankIcon(1)}</div>
                    <Badge className={getTierStyles(leaderboard[0].tier)}>
                      {leaderboard[0].tier}
                    </Badge>
                    <h3 className="font-bold text-xl text-indigo-950 mt-3 mb-1">
                      {leaderboard[0].company_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{leaderboard[0].industry}</p>
                    <div className="flex justify-center gap-4 text-sm">
                      <div>
                        <p className="font-bold text-indigo-600 text-lg">{leaderboard[0].students_sponsored}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-600 text-lg">{formatCurrency(leaderboard[0].total_funds)}</p>
                        <p className="text-xs text-gray-500">Funds</p>
                      </div>
                    </div>
                    {leaderboard[0].success_stories > 0 && (
                      <div className="mt-3 bg-emerald-50 rounded-lg py-2 px-3">
                        <Award className="h-4 w-4 text-emerald-600 inline mr-1" />
                        <span className="text-sm text-emerald-700 font-medium">
                          {leaderboard[0].success_stories} Success {leaderboard[0].success_stories === 1 ? 'Story' : 'Stories'}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-3xl font-bold text-amber-600">{leaderboard[0].impact_score}</p>
                      <p className="text-xs text-gray-500">Impact Score</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 3rd Place */}
              <div className="md:mt-8 order-2 md:order-3">
                <Card className={`${getRankBackground(3)} border-2 overflow-hidden`}>
                  <CardContent className="p-6 text-center">
                    <div className="mb-3">{getRankIcon(3)}</div>
                    <Badge className={getTierStyles(leaderboard[2].tier)}>
                      {leaderboard[2].tier}
                    </Badge>
                    <h3 className="font-bold text-lg text-indigo-950 mt-3 mb-1">
                      {leaderboard[2].company_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{leaderboard[2].industry}</p>
                    <div className="flex justify-center gap-4 text-sm">
                      <div>
                        <p className="font-bold text-indigo-600">{leaderboard[2].students_sponsored}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-600">{formatCurrency(leaderboard[2].total_funds)}</p>
                        <p className="text-xs text-gray-500">Funds</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-2xl font-bold text-gray-700">{leaderboard[2].impact_score}</p>
                      <p className="text-xs text-gray-500">Impact Score</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Rest of leaderboard */}
          {leaderboard.length > 3 && (
            <div className="space-y-3">
              {leaderboard.slice(3).map((company) => (
                <Card 
                  key={company.company_id}
                  className="bg-white border hover:shadow-md transition-shadow"
                  data-testid={`leaderboard-item-${company.rank}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 text-center">
                          {getRankIcon(company.rank)}
                        </div>
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-indigo-950">{company.company_name}</h3>
                            <Badge className={`${getTierStyles(company.tier)} text-xs`}>
                              {company.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{company.industry}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="font-bold text-indigo-600">{company.students_sponsored}</p>
                          <p className="text-xs text-gray-500">Students</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-emerald-600">{formatCurrency(company.total_funds)}</p>
                          <p className="text-xs text-gray-500">Funds</p>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <p className="font-bold text-gray-700">{company.impact_score}</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Impact Score Legend */}
          <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
            <h4 className="font-semibold text-indigo-950 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Tier Levels & Impact Score
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { tier: 'Diamond', score: '10,000+', color: getTierStyles('Diamond') },
                { tier: 'Platinum', score: '5,000+', color: getTierStyles('Platinum') },
                { tier: 'Gold', score: '2,000+', color: getTierStyles('Gold') },
                { tier: 'Silver', score: '1,000+', color: getTierStyles('Silver') },
                { tier: 'Bronze', score: '<1,000', color: getTierStyles('Bronze') }
              ].map((item) => (
                <div key={item.tier} className="text-center">
                  <Badge className={`${item.color} mb-1`}>{item.tier}</Badge>
                  <p className="text-xs text-gray-500">{item.score} pts</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Impact Score = (Students × 100) + (Funds Utilized ÷ 1000) + (Success Stories × 500)
            </p>
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">Join these leaders in transforming education</p>
            <a 
              href="/register?type=company" 
              className="inline-flex items-center gap-2 bg-indigo-950 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-900 transition-colors"
            >
              Start Your CSR Journey
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyLeaderboard;
