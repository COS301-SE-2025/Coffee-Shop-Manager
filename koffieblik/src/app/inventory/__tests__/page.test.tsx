import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import InventoryPage from '../page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the getTabs function
jest.mock('../../../constants/tabs', () => ({
  getTabs: jest.fn(() => ['Dashboard', 'Inventory', 'Orders', 'Logout']),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.confirm
const confirmMock = jest.fn(() => true);
Object.defineProperty(window, 'confirm', {
  value: confirmMock,
});

describe('InventoryPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    // Mock localStorage for logged-in state
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'isLoggedIn') return 'true';
      if (key === 'username') return 'TestUser';
      return null;
    });
  });

  // Test 1: Delete functionality works correctly
  test('deletes an item when delete button is clicked and confirmed', async () => {
    render(<InventoryPage />);
    
    // Find the delete button for Coffee beans (first item)
    const deleteButtons = screen.getAllByText('Delete');
    const firstDeleteButton = deleteButtons[0];
    
    // Click the delete button
    fireEvent.click(firstDeleteButton);
    
    // Wait for the item to be removed from the DOM
    await waitFor(() => {
      // The Coffee beans item should no longer be in the document
      expect(screen.queryByText('Coffee beans')).not.toBeInTheDocument();
    });
    
    // Verify that window.confirm was called
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete Coffee beans?');
  });

  test('does not delete item when confirmation is cancelled', async () => {
    // Mock confirm to return false (cancel)
    confirmMock.mockImplementationOnce(() => false);
    
    // Render the component
    render(<InventoryPage />);
    
    // Verify initial state
    expect(screen.getByText('Coffee beans')).toBeInTheDocument();
    
    // Find and click the delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify confirm was called
    expect(confirmMock).toHaveBeenCalled();
    
    // Verify item still exists
    expect(screen.getByText('Coffee beans')).toBeInTheDocument();
  });
});