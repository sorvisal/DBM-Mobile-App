import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { httpGet } from '@/services/http';

export type AddressResult = {
  placeId: string;
  name: string;
  displayName: string;
  latitude: string;
  longitude: string;
  houseNumber: string | null;
  road: string | null;
  neighbourhood: string | null;
  suburb: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  countryCode: string | null;
};

type AddressAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: AddressResult) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
};

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search address...',
  label,
  required,
  error,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const search = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setErrorMessage(null);
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    console.log('[AddressAutocomplete] searching:', query);
    try {
      const results = await httpGet<AddressResult[]>(
        `/geocoding/search?q=${encodeURIComponent(query)}`
      );
      console.log('[AddressAutocomplete] results:', results);
      const list = Array.isArray(results) ? results : [];
      setSuggestions(list);
      if (list.length === 0) {
        setErrorMessage('រកមិនឃើញអាសយដ្ឋាន — ព្យាយាមម្តងទៀត');
      }
    } catch (err) {
      console.error('[AddressAutocomplete] error:', err);
      const msg = (err as Error)?.message ?? 'Network error';
      setSuggestions([]);
      setErrorMessage(`បណ្តាញមានបញ្ហា: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    onChange(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      search(text);
    }, 500);
  };

  const handleSelect = (place: AddressResult) => {
    onChange(place.displayName);
    setInputValue(place.displayName);
    setSuggestions([]);
    inputRef.current?.blur();
    onSelect(place);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
      setErrorMessage(null);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      // suggestions already visible
    }
  };

  return (
    <View style={{ width: '100%' }}>
      {label && (
        <Text style={{ fontFamily: 'khmerMedium', fontSize: 18, color: '#111827', marginBottom: 6 }}>
          {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
        </Text>
      )}
      <View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: error ? '#F87171' : '#E5E7EB',
          borderRadius: 12,
          paddingHorizontal: 12,
          height: 44,
          backgroundColor: '#FFFFFF',
        }}>
          <Ionicons name="location-outline" size={20} color="#9CA3AF" />
          <TextInput
            ref={inputRef}
            value={inputValue}
            onChangeText={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor="#D1D5DB"
            style={{
              flex: 1,
              fontFamily: 'khmer',
              fontSize: 16,
              color: '#1F2937',
              marginLeft: 8,
              paddingVertical: 0,
            }}
          />
          {loading && (
            <ActivityIndicator size="small" color="#6B7280" />
          )}
          {!loading && inputValue && (
            <TouchableOpacity onPress={() => { setInputValue(''); onChange(''); setSuggestions([]); }} style={{ marginLeft: 4 }}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {loading && suggestions.length === 0 && (
          <View style={{
            marginTop: 4,
            paddingVertical: 12,
            alignItems: 'center',
          }}>
            <ActivityIndicator size="small" color="#6B7280" />
            <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4, fontFamily: 'khmer' }}>
              កំពុងស្វែងរក...
            </Text>
          </View>
        )}

        {!loading && suggestions.length > 0 && (
          <View style={{
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            maxHeight: 200,
            overflow: 'hidden',
          }}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {suggestions.map((place) => (
                <TouchableOpacity
                  key={place.placeId}
                  onPress={() => handleSelect(place)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                  }}
                >
                  <Text style={{ fontFamily: 'khmer', fontSize: 14, color: '#1F2937' }} numberOfLines={1}>
                    {place.name || place.displayName}
                  </Text>
                  <Text style={{ fontFamily: 'khmer', fontSize: 12, color: '#9CA3AF', marginTop: 2 }} numberOfLines={1}>
                    {place.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              backgroundColor: '#F9FAFB',
            }}>
              <Text style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'khmer' }}>
                © OpenStreetMap contributors
              </Text>
            </View>
          </View>
        )}

        {!loading && suggestions.length === 0 && inputValue.length >= 3 && !errorMessage && (
          <View style={{
            marginTop: 4,
            paddingVertical: 12,
            alignItems: 'center',
          }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13, fontFamily: 'khmer' }}>
              រកមិនឃើញលទ្ធផល
            </Text>
          </View>
        )}

        {errorMessage && (
          <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontFamily: 'khmer' }}>
            {errorMessage}
          </Text>
        )}
      </View>

      {error && !errorMessage && (
        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontFamily: 'khmer' }}>
          {error}
        </Text>
      )}
    </View>
  );
}
