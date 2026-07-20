package com.homeoscribe.repository;

import com.homeoscribe.model.DoctorPatientMap;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorPatientMapRepository extends MongoRepository<DoctorPatientMap, String> {

    Optional<DoctorPatientMap> findByDoctorId(String doctorId);

    boolean existsByDoctorId(String doctorId);
}
