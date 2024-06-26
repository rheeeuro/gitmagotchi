package user.entity;

import collection.entity.Collection;
import common.entity.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user")
public class User extends BaseEntity {
    @Id
    private Integer id;
    @Column(name = "profile_img")
    private String profileImg;
    private String nickname;
    @Column(name = "github_token")
    private String githubToken;
    @Column(name = "github_username")
    private String githubUsername;
    private Integer gold = 0;
    private Integer meal = 0;
    @Column(name = "last_time")
    private LocalDateTime lastTime = LocalDateTime.now();

    @Column(name = "background_id")
    private Integer backgroundId = 1; //현재의 배경화면
    @Column(name = "character_id")
    private Integer characterId;  //현재의 캐릭터

    @OneToMany(mappedBy = "user")
    private List<Collection> collectionList = new ArrayList<>();
}