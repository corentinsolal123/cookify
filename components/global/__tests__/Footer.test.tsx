import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

// Mock the Link component from @heroui/react
jest.mock('@heroui/react', () => ({
  Link: ({ children, ...props }) => (
    <a data-testid="mock-link" {...props}>
      {children}
    </a>
  ),
}));

describe('Footer', () => {
  it('renders correctly', () => {
    render(<Footer />);
    
    // Check if the footer element is in the document
    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();
    
    // Check if the link is rendered
    const linkElement = screen.getByTestId('mock-link');
    expect(linkElement).toBeInTheDocument();
    
    // Check if the text content is correct
    expect(screen.getByText('Powered by')).toBeInTheDocument();
    expect(screen.getByText('Co&Co² Enterprise')).toBeInTheDocument();
  });
});