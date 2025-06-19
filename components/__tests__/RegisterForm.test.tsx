import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpForm from '../auth/SignUpForm';
jest.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: () => mockAuthContext,
}));
jest.mock('@heroui/button', () => ({
  Button: (props: any) => <button {...props} />,
}));

const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  signUp: jest.fn(async () => ({ error: null })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  signInWithProvider: jest.fn(async () => ({ error: null })),
  supabase: {} as any,
};

// Mock the fetch function

describe('SignUpForm', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<SignUpForm />);

    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "S'inscrire" })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

    await waitFor(() => {
      expect(mockAuthContext.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(screen.getByText('Inscription réussie !')).toBeInTheDocument();
    });
  });

  it('displays error message on failed registration', async () => {
    mockAuthContext.signUp = jest.fn(async () => ({ error: { message: "Erreur" } }));

    render(<SignUpForm />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));
    
    await waitFor(() => {
      expect(screen.getByText(/Erreur/)).toBeInTheDocument();
    });
  });
});

