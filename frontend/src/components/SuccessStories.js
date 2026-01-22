import React, { useState, useEffect } from 'react';
import { Trophy, GraduationCap, Building2, Star, Quote, ChevronRight, Target } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import api from '../utils/api';

const SuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await api.get('/public/success-stories');
      setStories(response.data.success_stories || []);
    } catch (error) {
      console.error('Failed to load success stories:', error);
    } finally {
      setLoading(false);
    }
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

  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-950 to-indigo-900 relative overflow-hidden" data-testid="success-stories-section">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-400 px-4 py-2 rounded-full mb-6">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">Success Stories</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Dreams Turned Into Reality
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Real stories of students who achieved their IIT/NEET dreams through our CSR-funded education program
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <Card 
              key={story.story_id} 
              className="bg-white/10 backdrop-blur-lg border-white/20 text-white overflow-hidden group hover:bg-white/15 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
              data-testid={`success-story-${story.story_id}`}
            >
              <CardContent className="p-6">
                {/* Achievement Badge */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-emerald-500 text-white">
                    <Trophy className="h-3 w-3 mr-1" />
                    AIR {story.rank}
                  </Badge>
                  <span className="text-amber-400 text-sm font-semibold">{story.year}</span>
                </div>

                {/* Student Info */}
                <h3 className="font-heading text-xl font-bold mb-2 text-white group-hover:text-amber-400 transition-colors">
                  {story.student_name}
                </h3>
                <p className="text-gray-300 text-sm mb-4">{story.student_school}</p>

                {/* Achievement Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">{story.exam_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm">{story.college_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{story.branch}</span>
                  </div>
                </div>

                {/* Story Excerpt */}
                <p className="text-gray-300 text-sm line-clamp-3 mb-4 italic">
                  "{story.story_text}"
                </p>

                {/* Coaching Details */}
                {story.coaching_details && (
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-400">Coached at</p>
                    <p className="text-sm font-medium">{story.coaching_details.institute_name}</p>
                    <p className="text-xs text-gray-400">{story.coaching_details.institute_location}</p>
                  </div>
                )}

                {/* Company Sponsor */}
                {story.company_name && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-amber-400">Sponsored by {story.company_name}</span>
                    </div>
                    {story.company_testimonial && (
                      <div className="bg-amber-400/10 rounded-lg p-3 mt-2">
                        <Quote className="h-4 w-4 text-amber-400 mb-1" />
                        <p className="text-xs text-gray-300 italic">
                          {story.company_testimonial}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-300 mb-4">Want to create more success stories?</p>
          <a 
            href="/register?type=company" 
            className="inline-flex items-center gap-2 bg-marigold text-indigo-950 px-8 py-3 rounded-full font-bold hover:bg-amber-400 transition-colors"
          >
            Become a Sponsor
            <ChevronRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
