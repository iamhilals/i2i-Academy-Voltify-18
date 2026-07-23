import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Voltify login page', () => {
  render(<App />);
  const titleElement = screen.getByText(/Voltify/i);
  expect(titleElement).toBeInTheDocument();
});

