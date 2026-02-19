import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const recentTests = [
  { id: 1, name: 'John Doe', date: '2 days ago', score: '96%', status: 'PASSED' },
  { id: 2, name: 'Kevin Doe', date: '3 days ago', score: '88%', status: 'PASSED' },
  { id: 3, name: 'Person Y', date: '5 days ago', score: '53%', status: 'FAILED' },
];

export default function Statistics() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Assessment statistics</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="trending-up-outline" size={20} color="#10B981" />
              <Text style={styles.statLabel}>AVG STABILITY</Text>
            </View>
            <Text style={styles.statValue}>84.4%</Text>
            <Text style={styles.statChange}>+2.5% vs last week</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="clipboard-outline" size={20} color="#3B82F6" />
              <Text style={styles.statLabel}>TESTS RUN</Text>
            </View>
            <Text style={styles.statValue}>28</Text>
            <Text style={styles.statSubtext}>Last 30 days</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>RECENT PROTOCOLS</Text>
        
        {recentTests.map((test) => (
          <View key={test.id} style={styles.testCard}>
            <View style={styles.testLeft}>
              <Text style={styles.testName}>{test.name}</Text>
              <Text style={styles.testDate}>{test.date}</Text>
            </View>
            <View style={styles.testRight}>
              <Text style={styles.testScore}>{test.score}</Text>
              <View style={[
                styles.statusBadge,
                test.status === 'PASSED' ? styles.passedBadge : styles.failedBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  test.status === 'PASSED' ? styles.passedText : styles.failedText
                ]}>
                  {test.status}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>View more</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#10B981',
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testLeft: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  testDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  testRight: {
    alignItems: 'flex-end',
  },
  testScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  passedBadge: {
    backgroundColor: '#DBEAFE',
  },
  failedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  passedText: {
    color: '#3B82F6',
  },
  failedText: {
    color: '#EF4444',
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
});