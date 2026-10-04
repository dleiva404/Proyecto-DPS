import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { theme } from '../../theme/theme';
import CustomButton from '../../components/CustomButton';

export default function InicioScreen({ route, navigation }) {
  // Obtenemos el rol del usuario (por defecto 'empleado' si no se especifica)
  const userRole = route?.params?.role || 'empleado'; 

  return (
    <ScrollView style={styles.container}>
      {/* Encabezado Principal Corporativo */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Gestión de Recursos Humanos Grupo Calma</Text>
        <Text style={styles.roleBadge}>Rol Activo: {userRole.toUpperCase()}</Text>
      </View>

      {/* Contenido Dinámico según el rol */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Panel de Control</Text>
        
        {userRole === 'empleado' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mis Trámites</Text>
            <Text style={styles.cardDesc}>Consulta el estado actual de tus permisos, vacaciones y constancias laborales.</Text>
            <CustomButton 
              title="Ver Solicitudes" 
              type="primary"
              onPress={() => alert('Navegando a solicitudes')} 
            />
          </View>
        )}

        {(userRole === 'jefe' || userRole === 'analista' || userRole === 'gerente') && (
          <View style={[styles.card, styles.approvalCard]}>
            <Text style={styles.cardTitle}>Aprobaciones Pendientes</Text>
            <Text style={styles.cardDesc}>Tienes solicitudes recientes de tu personal a la espera de revisión.</Text>
            <CustomButton 
              title="Revisar Bandeja" 
              type="accent"
              onPress={() => alert('Navegando a bandeja')} 
            />
          </View>
        )}

        {userRole === 'rrhh' && (
          <View style={[styles.card, styles.hrCard]}>
            <Text style={styles.cardTitle}>Administración General (RRHH)</Text>
            <Text style={styles.cardDesc}>Gestión global de reportes, constancias y estadísticas de la empresa.</Text>
            <CustomButton 
              title="Generar Reportes" 
              type="primary"
              onPress={() => alert('Navegando a reportes')} 
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    backgroundColor: theme.colors.primaryDark,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.accent, 
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  roleBadge: {
    color: theme.colors.accent,
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
  },
  section: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  approvalCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  hrCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
});