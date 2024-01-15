#Utilisons
FROM nginx:alpine

#Ajoutons une étiquette pour spécifier l'auteur
LABEL maker="ABA ACHI SERGE <achi.aba21@inphb.ci>"
LABEL version=v1.0.0
#Copions les fichiers HTML, CSS, JS et les images dans les répertoires appropriés de l'image COPY *.html /usr/share/nginx/html/
COPY *.html /usr/share/html
COPY *.js /usr/share/html
COPY *.css /usr/share/html
#Exposons le port 80 pour que l'application puisse être accessible depuis l'extérieur
EXPOSE 80 
# Commande à exécuter lorsque le conteneur démarre
CMD ["nginx", "-g", "daemon off;"]