import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterForm from '../auth/RegisterForm';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

describe('RegisterForm', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<RegisterForm />);
    
    // Check if the form elements are rendered
    expect(screen.getByText('Inscription')).toBeInTheDocument();
    expect(screen.getByLabelText("Nom d'utilisateur")).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "S'inscrire" })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<RegisterForm />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText("Nom d'utilisateur"), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));
    
    // Check if fetch was called with the correct arguments
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
      });
    });
    
    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.')).toBeInTheDocument();
    });
  });

  it('displays error message on failed registration', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );
    
    render(<RegisterForm />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText("Nom d'utilisateur"), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText("❌ Erreur lors de l'inscription.")).toBeInTheDocument();
    });
  });
});