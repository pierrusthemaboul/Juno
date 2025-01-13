import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClients';

const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    try {
      // 1. Récupérer l'utilisateur courant
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // 2. Vérifier le statut admin dans la table profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du statut admin:', error.message);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!profile?.is_admin);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier le statut initial
    checkAdminStatus();

    // S'abonner aux changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
};

export default useAdminStatus;