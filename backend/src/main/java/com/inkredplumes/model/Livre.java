package com.inkredplumes.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "livre")
public class Livre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idLivre") // 👈 correspond à la colonne SQL exacte
    private Integer idLivre;

    @Column(name = "titre")
    private String titre;

    @Column(name = "resume")
    private String resume;

    @Column(name = "prix")
    private Double prix;

    @Column(name = "quantite")
    private int quantite;
    
    @Column(name = "dateParution")
    private LocalDate dateParution;
    
    @Column(name = "imagePath")
    private String imagePath;

    @Column(name = "auteurId")
    private Integer auteurId;
    
   
    @Transient
    private List<Integer> categorieIds;

    public List<Integer> getCategorieIds() {
        return categorieIds;
    }

    public void setCategorieIds(List<Integer> categorieIds) {
        this.categorieIds = categorieIds;
    }
    // Getters et Setters

    public Integer getIdLivre() {
        return idLivre;
    }

    public void setIdLivre(Integer idLivre) {
        this.idLivre = idLivre;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getResume() {
        return resume;
    }

    public void setResume(String resume) {
        this.resume = resume;
    }

    public Double getPrix() {
        return prix;
    }

    public void setPrix(Double prix) {
        this.prix = prix;
    }
    
    

    public int getQuantite() {
		return quantite;
	}

	public void setQuantite(int quantite) {
		this.quantite = quantite;
	}

	public LocalDate getDateParution() {
        return dateParution;
    }

    public void setDateParution(LocalDate dateParution) {
        this.dateParution = dateParution;
    }
    
 // Getter & Setter
    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public Integer getAuteurId() {
        return auteurId;
    }

    public void setAuteurId(Integer auteurId) {
        this.auteurId = auteurId;
    }

}
