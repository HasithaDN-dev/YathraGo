import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label: string;
  value?: string;
  placeholder: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export function CustomSelect({ 
  label, 
  value, 
  placeholder, 
  options, 
  onSelect, 
  required = false,
  error,
  className = '' 
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  return (
    <View className={`mb-4 ${className}`}>
      <Text 
        className="text-sm font-medium text-gray-700 mb-2"
        style={{ fontFamily: 'Figtree-Medium' }}
      >
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={`border rounded-lg px-4 py-3 flex-row items-center justify-between bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <Text 
          className={selectedOption ? 'text-black' : 'text-gray-400'}
          style={{ 
            fontFamily: 'Figtree-Regular',
            fontSize: 16
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={Colors.tabIconDefault}
        />
      </TouchableOpacity>

      {error && (
        <Text 
          className="text-red-500 text-sm mt-1"
          style={{ fontFamily: 'Figtree-Regular' }}
        >
          {error}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl max-h-80">
            <View className="p-4 border-b border-gray-200">
              <Text 
                className="text-lg font-semibold text-center"
                style={{ 
                  fontFamily: 'Figtree-SemiBold',
                  color: Colors.tabIconSelected
                }}
              >
                {label}
              </Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className="p-4 border-b border-gray-100"
                >
                  <Text 
                    className="text-base"
                    style={{ 
                      fontFamily: 'Figtree-Regular',
                      color: item.value === value ? Colors.tabIconSelected : '#000000'
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              className="p-4 border-t border-gray-200"
            >
              <Text 
                className="text-center text-base"
                style={{ 
                  fontFamily: 'Figtree-Medium',
                  color: Colors.tabIconDefault
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
