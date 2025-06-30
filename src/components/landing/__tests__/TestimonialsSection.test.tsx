import React from 'react';
import { screen } from '@testing-library/react';
import { TestimonialsSection } from '../TestimonialsSection';
import { renderComponent, getSection, expectResponsiveLayout, expectSemanticStructure } from './test-utils';

// Mock the TestimonialCard component
jest.mock('../TestimonialCard', () => ({
  TestimonialCard: ({ quote, author }: {
    quote: string;
    author: { name: string; title: string };
  }) => (
    <div data-testid="testimonial-card">
      <div data-testid="testimonial-content">{quote}</div>
      <div data-testid="testimonial-name">{author.name}</div>
      <div data-testid="testimonial-role">{author.title}</div>
      <div data-testid="testimonial-avatar">avatar</div>
    </div>
  ),
}));

describe('TestimonialsSection Component', () => {
  let renderedComponent: any;

  beforeEach(() => {
    renderedComponent = renderComponent(TestimonialsSection);
  });

  it('renders section heading about user testimonials and social proof', () => {
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/testimonial|review|what.*say|love/i);
  });

  it('displays multiple customer testimonials for credibility', () => {
    const testimonialCards = screen.getAllByTestId('testimonial-card');
    expect(testimonialCards.length).toBeGreaterThanOrEqual(3); // Should have at least 3 testimonials
  });

  it('shows testimonials from different types of D&D users', () => {
    const roles = screen.getAllByTestId('testimonial-role');
    const roleTexts = roles.map(role => role.textContent?.toLowerCase() || '');

    // Should have diverse user types
    expect(roleTexts.some(role => role.includes('dm') || role.includes('dungeon master'))).toBe(true);
    expect(roleTexts.some(role => role.includes('player'))).toBe(true);
  });

  it('includes compelling testimonial content that highlights key benefits', () => {
    const testimonialContents = screen.getAllByTestId('testimonial-content');

    testimonialContents.forEach(content => {
      expect(content.textContent).toBeTruthy();
      expect(content.textContent!.length).toBeGreaterThan(20); // Substantial testimonial content
    });

    // Should mention key app benefits
    const allText = testimonialContents.map(content => content.textContent).join(' ').toLowerCase();
    expect(allText).toMatch(/encounter|combat|initiative|character|easy|simple|streamline|manage/);
  });

  it('displays customer names and roles for authenticity', () => {
    const names = screen.getAllByTestId('testimonial-name');
    const roles = screen.getAllByTestId('testimonial-role');

    names.forEach(name => {
      expect(name.textContent).toBeTruthy();
      expect(name.textContent!.length).toBeGreaterThan(2);
    });

    roles.forEach(role => {
      expect(role.textContent).toBeTruthy();
      expect(role.textContent!.length).toBeGreaterThan(2);
    });
  });

  it('uses responsive layout for testimonial display', () => {
    const section = getSection(screen);
    expectResponsiveLayout(section);
    expect(section).toHaveClass('py-16');

    // Should have responsive grid or layout for testimonials
    const testimonialsGrid = section?.querySelector('.grid');
    expect(testimonialsGrid).toBeInTheDocument();
  });

  it('includes customer avatars for personal connection', () => {
    const avatars = screen.getAllByTestId('testimonial-avatar');
    expect(avatars.length).toBeGreaterThan(0); // Should have some customer avatars
  });

  it('emphasizes positive emotional outcomes from using the app', () => {
    const testimonialContents = screen.getAllByTestId('testimonial-content');
    const allTestimonialText = testimonialContents
      .map(content => content.textContent)
      .join(' ')
      .toLowerCase();

    // Should contain positive emotional words
    expect(allTestimonialText).toMatch(/love|amazing|great|fantastic|perfect|excellent|wonderful|game.*changer|transform/);
  });

  it('highlights specific feature benefits mentioned by users', () => {
    const testimonialContents = screen.getAllByTestId('testimonial-content');
    const allTestimonialText = testimonialContents
      .map(content => content.textContent)
      .join(' ')
      .toLowerCase();

    // Should mention specific app features
    expect(allTestimonialText).toMatch(/initiative|hp.*tracking|encounter.*building|lair.*action|mobile|tablet/);
  });

  it('shows variety in user experience levels', () => {
    const roles = screen.getAllByTestId('testimonial-role');
    const roleTexts = roles.map(role => role.textContent?.toLowerCase() || '');

    // Should have mix of experience levels
    expect(roleTexts.some(role => role.includes('new') || role.includes('beginner'))).toBe(true);
    expect(roleTexts.some(role => role.includes('veteran') || role.includes('experienced'))).toBe(true);
  });

  it('has proper semantic structure for accessibility', () => {
    const section = getSection(screen);
    expectSemanticStructure(section);
  });
});
