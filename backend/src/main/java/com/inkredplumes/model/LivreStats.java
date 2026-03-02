package com.inkredplumes.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity(name = "vue_stats_livres") // nom exact de la vue SQL
public class LivreStats {

    @Id
    private Integer idLivre;
    private String titre;
    private Double prix;
    private String imagePath;
    private Integer auteurId;
    private Integer nombreVentes;
    private Double moyenneNote;

    // Getters et setters

    public Integer getIdLivre() { return idLivre; }
    public void setIdLivre(Integer idLivre) { this.idLivre = idLivre; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public Double getPrix() { return prix; }
    public void setPrix(Double prix) { this.prix = prix; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public Integer getAuteurId() { return auteurId; }
    public void setAuteurId(Integer auteurId) { this.auteurId = auteurId; }

    public Integer getNombreVentes() { return nombreVentes; }
    public void setNombreVentes(Integer nombreVentes) { this.nombreVentes = nombreVentes; }

    public Double getMoyenneNote() { return moyenneNote; }
    public void setMoyenneNote(Double moyenneNote) { this.moyenneNote = moyenneNote; }
}
