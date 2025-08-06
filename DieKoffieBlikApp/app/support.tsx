import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  Platform,
  Pressable,
  Linking,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const contactMethods = [
    {
      id: 'phone',
      title: 'Call Us',
      subtitle: '+27 11 234 5678',
      description: 'Available 24/7',
      icon: 'call',
      action: () => Linking.openURL('tel:+27112345678')
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: '+27 82 456 7890',
      description: 'Quick response',
      icon: 'logo-whatsapp',
      action: () => Linking.openURL('https://wa.me/27824567890')
    },
    {
      id: 'email',
      title: 'Email Support',
      subtitle: 'support@diekoffieblik.co.za',
      description: 'Response within 24hrs',
      icon: 'mail',
      action: () => Linking.openURL('mailto:support@diekoffieblik.co.za')
    }
    
  ];

//   const quickActions = [
    
//     {
//       title: 'Report an Issue',
//       description: 'Something wrong with your order?',
//       icon: 'warning',
//       route: '/report-issue'
//     },
    
//     {
//       title: 'App Feedback',
//       description: 'Help us improve',
//       icon: 'thumbs-up',
//       route: '/feedback'
//     }
//   ];

//   const faqData = [
//     {
//       id: '1',
//       question: 'How do I track my order?',
//       answer: 'You can track your order in real-time through the "Order History" section in your profile or by clicking the tracking link sent to your email/SMS.'
//     },
//     {
//       id: '2',
//       question: 'What are your delivery hours?',
//       answer: 'We deliver Monday to Sunday from 7:00 AM to 9:00 PM. Orders placed after 9:00 PM will be delivered the next day.'
//     },
//     {
//       id: '3',
//       question: 'How much is delivery?',
//       answer: 'Delivery is free for orders over R100. For orders under R100, there is a R15 delivery fee. We deliver within 15km of our stores.'
//     },
//     {
//       id: '4',
//       question: 'Can I cancel my order?',
//       answer: 'You can cancel your order within 5 minutes of placing it. After that, please contact our support team and we\'ll do our best to help.'
//     },
//     {
//       id: '5',
//       question: 'Do you offer refunds?',
//       answer: 'Yes, we offer full refunds for cancelled orders and partial refunds for missing items. Refunds are processed within 3-5 business days.'
//     },
//     {
//       id: '6',
//       question: 'How do I update my payment method?',
//       answer: 'Go to Profile > Payment Methods to add, edit, or remove payment methods. You can also set a default payment method.'
//     }
//   ];

  const appInfo = {
    version: '1.0.0',
    lastUpdated: 'July 2024',
    platform: Platform.OS === 'ios' ? 'iOS' : 'Android'
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const NavBar = () => (
    <View style={styles.navbar}>
      <View style={styles.navLeft}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
          android_ripple={{ color: '#78350f20' }}
        >
          <Ionicons name="arrow-back" size={24} color="#78350f" />
        </Pressable>
        <Text style={styles.navTitle}>Help & Support</Text>
      </View>
    </View>
  );

  const HeaderSection = () => (
    <View style={styles.headerSection}>
      <LinearGradient
        colors={['#78350f', '#92400e']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.supportContainer}>
            <Ionicons name="help-circle" size={60} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>We're Here to Help</Text>
          <Text style={styles.headerSubtitle}>
            Get support when you need it most
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  const ContactMethodCard = ({ method }: { method: any }) => (
    <Pressable 
      style={styles.contactCard}
      onPress={method.action}
      android_ripple={{ color: '#78350f10' }}
    >
      <View style={styles.contactIconContainer}>
        <Ionicons name={method.icon} size={24} color="#78350f" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{method.title}</Text>
        <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
        <Text style={styles.contactDescription}>{method.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </Pressable>
  );

  const QuickActionCard = ({ action }: { action: any }) => (
    <Pressable 
      style={styles.quickActionCard}
      onPress={() => router.push(action.route)}
      android_ripple={{ color: '#78350f10' }}
    >
      <View style={styles.quickActionLeft}>
        <View style={styles.quickActionIcon}>
          <Ionicons name={action.icon} size={20} color="#78350f" />
        </View>
        <View>
          <Text style={styles.quickActionTitle}>{action.title}</Text>
          <Text style={styles.quickActionDescription}>{action.description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </Pressable>
  );

  const FAQItem = ({ item }: { item: any }) => (
    <View style={styles.faqItem}>
      <Pressable 
        style={styles.faqQuestion}
        onPress={() => toggleFAQ(item.id)}
        android_ripple={{ color: '#78350f10' }}
      >
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <Ionicons 
          name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#78350f" 
        />
      </Pressable>
      {expandedFAQ === item.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />
      <NavBar />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderSection />
        
        {/* Contact Methods */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {contactMethods.map((method) => (
            <ContactMethodCard key={method.id} method={method} />
          ))}
        </View>
        
        {/* Quick Actions
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} action={action} />
          ))}
        </View> */}
        
        {/* FAQ Section
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqData.map((item) => (
            <FAQItem key={item.id} item={item} />
          ))}
        </View> */}
        
        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfoCard}>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Version</Text>
              <Text style={styles.appInfoValue}>{appInfo.version}</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Platform</Text>
              <Text style={styles.appInfoValue}>{appInfo.platform}</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Last Updated</Text>
              <Text style={styles.appInfoValue}>{appInfo.lastUpdated}</Text>
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Still need help?</Text>
          <Text style={styles.footerText}>
            Our support team is available 24/7 to assist you with any questions or concerns.
          </Text>
          <Pressable style={styles.contactSupportButton}>
            <Ionicons name="headset" size={16} color="#fff" />
            <Text style={styles.contactSupportText}>Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Navigation Bar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350f',
  },
  
  // Header Section
  headerSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#78350f',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  supportContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#ffffff20',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fed7aa',
    textAlign: 'center',
  },
  
  // Section Titles
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 16,
  },
  
  // Contact Section
  contactSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  contactCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#fff7ed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#9ca3af',
  },
  
  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  quickActionCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff7ed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 2,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#9ca3af',
  },
  
  // FAQ Section
  faqSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350f',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  
  // App Info Section
  appInfoSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  appInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350f',
  },
  
  // Footer
  footer: {
    paddingHorizontal: 20,
    marginTop: 32,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#78350f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactSupportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});